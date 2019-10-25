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

    public async trande(userId: string, offerId: string): Promise<ResponseModel> {
        const offer = await this.offerStorage.getByID(offerId);
        let buyerId: string; 
        let sellerId: string;
        if(offer.type === OfferType.Buy) {
            buyerId = offer.userId;
            sellerId = userId;
        } else {
            buyerId = userId;
            sellerId = offer.userId;
        }
        const buyer = await this.inhabitantStorage.getByID(buyerId);
        const seller = await this.inhabitantStorage.getByID(sellerId);

        this.logger.info(`Validating buyer ${buyerId} for offer ${offer.uuid}`);
        const buyerValidation = await this.validationService.validateBuy(buyer, offer);
        if(buyerValidation.status !== 200) {
            return buyerValidation;
        }
        this.logger.info(`Validating seller ${sellerId} for offer ${offer.uuid}`);
        const sellerValidation = await this.validationService.validateSell(seller, offer);
        if(sellerValidation.status !== 200) {
            return sellerValidation;
        }

        await this.taxesService.applyTaxes(seller, buyer, offer);
        await this.exchangeGoods(seller, buyer, offer);
        await this.offerStorage.closeOffer(offer);
        return {
            status: 200, 
            message: "The trade passed successfully."
        }
    }

    public async exchangeGoods(seller: Inhabitant, buyer: Inhabitant, offer: Offer) {
        
        this.logger.info(`[exchangeGoods] Executing offer ${offer.uuid}`);
        seller.belongings[offer.goods] = Number(seller.belongings[offer.goods]) - Number(offer.amount);
        seller.moneyAmount = (Number(seller.moneyAmount) + Number(offer.price)).toString();

        buyer.belongings[offer.goods] = Number(buyer.belongings[offer.goods]) + Number(offer.amount);
        buyer.moneyAmount = (Number(buyer.moneyAmount) - Number(offer.price)).toString();


        this.logger.info(`[exchangeGoods] Updating seller belongings ${offer.uuid}`);
        this.inhabitantStorage.update(seller);
        this.logger.info(`[exchangeGoods] Updating buyer belongings ${offer.uuid}`);
        this.inhabitantStorage.update(buyer);
        this.logger.info(`[exchangeGoods] Successfully exchanged the items for offer: ${offer.uuid}`);

    }
}