import { LoggerService } from "../services";
import { injectable } from "inversify";
import { InhabitantStorage, OfferStorage, TransactionStorage } from "../storages";
import { Offer } from "../models";

export class ResponseModel {
    status: number;
    message: string;
};


@injectable()
export class ValidationService {
    constructor(
        private logger: LoggerService,
        private offerStorage: OfferStorage,
        private inhabitantStorage: InhabitantStorage,
        private transactionStorage: TransactionStorage) {
    }

    public async validateSell(offer: Offer): Promise<ResponseModel> {

        const sellerHistory = await this.transactionStorage.getBySellerId(offer.userId, 3); 
        if(sellerHistory.length === 3 && sellerHistory.every((elem, index, arr) => elem.goods === "book")) {
            return {
                status: 400, 
                message: "The seller can't place an offer for book 3 times in a row."
            };
        };

        try{
            await this.offerStorage.create(offer);
            return {
                status: 201, 
                message: "Offer has been placed."
            }; 
        } catch(err) {
            this.logger.error("Couldn't place an offer");
            return {
                status: 500,
                message: "Couln't place an offer. Try again later.";
            }
        }
    }

    public async validateBuy(offer: Offer): Promise<ResponseModel> {
        const buyer = await this.inhabitantStorage.getByID(offer.id);
        if(offer.goods === "bike" && buyer.belongings.bikes === 2) {
            return {
                status: 400, 
                message: "The buyer can't buy a third bike."
            };
        }

        if(offer.goods === "coal" && 
            buyer.belongings.coal + Number(offer.amount) === Number(process.env.GLOBAL_COAL_MARKET) * 0.1) {
            return {
                status: 400, 
                message: "The buyer can't owe more than 10 percent of the global coal market."
            };
        }
        
        const buyerHistory = await this.transactionStorage.getByBuyerId(offer.userId, 2);
        if(buyerHistory.length === 2 && buyerHistory.every((elem, index, arr) => elem.goods === "bike")) {
            return {
                status: 400, 
                message: "The buyer can't place an offer for bike 2 times in a row."
            };
        };
    }
}