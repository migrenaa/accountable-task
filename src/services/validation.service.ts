import { injectable } from "inversify";
import { Offer, ResponseModel, Inhabitant, ProductType } from "../models";
import { TransactionStorage } from "../storages";
import { Big } from "big.js";
import { LoggerService } from "../services";

@injectable()
export class ValidationService {
    constructor(
        private logger: LoggerService,
        private transactionStorage: TransactionStorage
    ) {
    }

    public async validateSell(seller: Inhabitant, offer: Offer): Promise<ResponseModel> {
        if (seller.products[offer.productType] < offer.amount) {
            return {
                status: 400,
                message: "The wants to sell more than it has from this products."
            };
        };
        const sellerHistory = await this.transactionStorage.getBySellerId(seller.id, 3);
        if (sellerHistory.length === 3 && sellerHistory.every((elem, index, arr) => elem.productType === ProductType.Books)) {
            return {
                status: 400,
                message: "The seller can't place an offer for book 3 times in a row."
            };
        }

        return {
            status: 200,
            message: "Offer can be placed."
        };

    }

    public async validateBuy(buyer: Inhabitant, offer: Offer): Promise<ResponseModel> {
        if (Big(buyer.balance).lt(Big(offer.amount).mul(offer.price))) {
            return {
                status: 400,
                message: "The buyer doesn't have enough money."
            };
        }
        if (offer.productType === ProductType.Bikes && buyer.products.bikes === 2) {
            return {
                status: 400,
                message: "The buyer can't buy a third bike."
            };
        }

        if (offer.productType === "coal" &&
            buyer.products.coal + offer.amount === Number(process.env.GLOBAL_COAL_MARKET) * 0.1) {
            return {
                status: 400,
                message: "The buyer can't own more than 10 percent of the global coal market."
            };
        }

        const buyerHistory = await this.transactionStorage.getByBuyerId(buyer.id, 2);
        if (buyerHistory.length === 2 && buyerHistory.every((elem, index, arr) => elem.productType === ProductType.Bikes)) {
            return {
                status: 400,
                message: "The buyer can't place an offer for a bike 2 times in a row."
            };
        };

        return {
            status: 200,
            message: "Offer can be placed."
        }
    }
}