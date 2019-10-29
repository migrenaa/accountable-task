import { ResponseModel, Offer, Inhabitant, Transaction, Status } from "../models";
import { injectable } from "inversify";
import { LoggerService } from "./logger.service";
import { ValidationService } from "./validation.service";
import { TaxesService } from "./taxes.service";
import { OfferStorage, InhabitantStorage, TransactionStorage } from "../storages";
import { OfferType } from "../models";
import { Big } from "big.js";

@injectable()
export class OfferService {

    constructor(
        private logger: LoggerService,
        private offerStorage: OfferStorage,
        private inhabitantStorage: InhabitantStorage,
        private validationService: ValidationService,
        private taxesService: TaxesService,
        private transactionStorage: TransactionStorage
    ) {
    }

    public async trade(inhabitantId: string, offerId: string): Promise<ResponseModel> {
        const offer = await this.offerStorage.getByID(offerId);

        if (inhabitantId === offer.inhabitantId) {
            return {
                status: Status.InvalidBuyer,
                message: "The inhabitant can't accept it's own offers."
            }
        }
        let buyerId: string;
        let sellerId: string;
        if (offer.type === OfferType.Buy) {
            buyerId = offer.inhabitantId;
            sellerId = inhabitantId;
        } else {
            buyerId = inhabitantId;
            sellerId = offer.inhabitantId;
        }
        const buyer = await this.inhabitantStorage.getByID(buyerId);
        const seller = await this.inhabitantStorage.getByID(sellerId);

        this.logger.info(`Validating buyer ${buyerId} for offer ${offer.id}`);
        const buyerValidation = await this.validationService.validateBuy(buyer, offer);
        if (buyerValidation.status !== Status.Success) {
            return buyerValidation;
        }
        this.logger.info(`Validating seller ${sellerId} for offer ${offer.id}`);
        const sellerValidation = await this.validationService.validateSell(seller, offer);
        if (sellerValidation.status !== Status.Success) {
            return sellerValidation;
        }

        await this.taxesService.applyTaxes(seller, buyer, offer);
        await this.exchangeProducts(seller, buyer, offer);
        await this.offerStorage.closeOffer(offer);
        await this.storeTransaction(seller, buyer, offer);
        return {
            status: Status.Success,
            message: "The trade passed successfully."
        }
    }

    public async placeOffer(offer: Offer): Promise<ResponseModel> {
        const inhabitant = await this.inhabitantStorage.getByID(offer.inhabitantId);
        const validationResult = OfferType.Buy
            ? await this.validationService.validateBuy(inhabitant, offer)
            : await this.validationService.validateSell(inhabitant, offer);
        if (validationResult.status !== Status.Success) {
            return validationResult;
        }
        const created = await this.offerStorage.create(offer);
        return {
            status: Status.Success,
            message: "Offer placed",
            object: {
                id: created.id
            }
        };
    }


    // TODO move to helper class so that you can mock in the unit tests
    private async exchangeProducts(seller: Inhabitant, buyer: Inhabitant, offer: Offer): Promise<void> {

        this.logger.info(`[exchangeProducts] Executing offer ${offer.id}`);
        seller.products[offer.productType] = Number(seller.products[offer.productType]) + Number(offer.amount);
        seller.balance = Big(seller.balance).plus(offer.price).toString();

        buyer.products[offer.productType] = Number(buyer.products[offer.productType]) + Number(offer.amount);
        buyer.balance = Big(buyer.balance).minus(offer.price).toString();

        this.logger.info(`[exchangeProducts] Updating seller products ${offer.id}`);
        this.inhabitantStorage.update(seller);
        this.logger.info(`[exchangeProducts] Updating buyer products ${offer.id}`);
        this.inhabitantStorage.update(buyer);
        this.logger.info(`[exchangeProducts] Successfully exchanged the items for offer: ${offer.id}`);
    }

    private async storeTransaction(seller: Inhabitant, buyer: Inhabitant, offer: Offer): Promise<void> {
        const transaction: Transaction = {
            id: undefined,
            buyerId: buyer.id,
            buyerName: buyer.name,
            sellerId: seller.id,
            sellerName: seller.name,
            productType: offer.productType,
            price: offer.price,
            datePlaced: offer.datePlaced,
            amount: offer.amount,
            dateTraded: Date.now().toString()
        };

        await this.transactionStorage.create(transaction);
    }
}