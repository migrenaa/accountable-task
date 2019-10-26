import { ResponseModel, Offer, Inhabitant } from "../models";
import { injectable } from "inversify";
import { LoggerService } from "./logger.service";
import { ValidationService } from "./validation.service";
import { TaxesService } from "./taxes.service";
import { OfferStorage, InhabitantStorage } from "../storages";
import { OfferType } from "../models";

@injectable()
export class OfferService {

    constructor(
        private logger: LoggerService,
        private offerStorage: OfferStorage,
        private inhabitantStorage: InhabitantStorage,
        private validationService: ValidationService,
        private taxesService: TaxesService
    ) {
    }

    public async trande(inhabitantId: string, offerId: string): Promise<ResponseModel> {
        const offer = await this.offerStorage.getByID(offerId);

        if (inhabitantId === offer.inhabitantId) {
            return {
                status: 400,
                message: "A user can't accept it's own offers."
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
        if (buyerValidation.status !== 200) {
            return buyerValidation;
        }
        this.logger.info(`Validating seller ${sellerId} for offer ${offer.id}`);
        const sellerValidation = await this.validationService.validateSell(seller, offer);
        if (sellerValidation.status !== 200) {
            return sellerValidation;
        }

        await this.taxesService.applyTaxes(seller, buyer, offer);
        await this.exchangeProducts(seller, buyer, offer);
        await this.offerStorage.closeOffer(offer);
        return {
            status: 200,
            message: "The trade passed successfully."
        }
    }

    public async exchangeProducts(seller: Inhabitant, buyer: Inhabitant, offer: Offer): Promise<void> {

        this.logger.info(`[exchangeProducts] Executing offer ${offer.id}`);
        seller.products[offer.productType] = Number(seller.products[offer.productType]) - Number(offer.amount);
        seller.balance = (Number(seller.balance) + Number(offer.price)).toString();

        buyer.products[offer.productType] = Number(buyer.products[offer.productType]) + Number(offer.amount);
        buyer.balance = (Number(buyer.balance) - Number(offer.price)).toString();


        this.logger.info(`[exchangeProducts] Updating seller belongings ${offer.id}`);
        this.inhabitantStorage.update(seller);
        this.logger.info(`[exchangeProducts] Updating buyer belongings ${offer.id}`);
        this.inhabitantStorage.update(buyer);
        this.logger.info(`[exchangeProducts] Successfully exchanged the items for offer: ${offer.id}`);
    }

    public async placeOffer(offer: Offer): Promise<ResponseModel> {
        const inhabitant = await this.inhabitantStorage.getByID(offer.inhabitantId);
        const validationResult = OfferType.Buy
            ? await this.validationService.validateBuy(inhabitant, offer)
            : await this.validationService.validateSell(inhabitant, offer);
        if(validationResult.status !== 200) {
            return validationResult;
        }
        await this.offerStorage.create(offer);
        return {
            status: 200, 
            message: "Offer placed"
        };
    }
}