import { LoggerService } from "../services";
import { InhabitantStorage } from "../storages";
import { Offer, Inhabitant, Goods } from "../models";
import { injectable } from "inversify";

@injectable()
export class TaxesService {

    constructor(
        private logger: LoggerService,
        private inhabitantStorage: InhabitantStorage) {
    }

    public async applyTaxes(seller: Inhabitant, buyer: Inhabitant, offer: Offer) {

        this.logger.info(`Applying taxes for offer ${offer.uuid}`);

        buyer.moneyAmount = (Number(buyer.moneyAmount) - await this.calculateBuyTax(buyer, offer)).toString();
        this.logger.info(`Updating buyer ${buyer.uuid} money amount with ${buyer.moneyAmount}`);
        await this.inhabitantStorage.update(buyer);

        seller.moneyAmount = (Number(seller.moneyAmount) - await this.calculateSellTax(seller, offer)).toString();
        this.logger.info(`Updating seller ${seller.uuid} money amount with ${seller.moneyAmount}`);
        await this.inhabitantStorage.update(seller);

        this.logger.info("Updating bank balance");
        // await this.bankStorage.update(); 
    }

    public async calculateSellTax(seller: Inhabitant, offer: Offer): Promise<number> {
        const taxCalculation = this.getSellTax(offer.goods) - seller.belongings.bikes * 5
        const tax = taxCalculation > 0 ? taxCalculation : 0;
        return Number(offer.amount) * tax / 100;
    }

    public async calculateBuyTax(buyer: Inhabitant, offer: Offer): Promise<number> {

        let taxPercent;
        taxPercent = this.getBuyTax(offer.goods);
        if (offer.goods === Goods.Books) {
            const taxForHavingCoal = buyer.belongings.coal * 5;
            taxPercent = taxForHavingCoal < 50 ? taxForHavingCoal : 50;
        }
        return Number(offer.amount) * taxPercent / 100;
    }

    public getBuyTax(goods: Goods): number {
        
        this.logger.info(`Getting tax for buying ${goods}`);
        switch (goods) {
            case Goods.Coal:
                return 75;
            case Goods.Cheese:
            case Goods.Bikes:
                return 15;
            case Goods.Books:
                return 0;
            default:
                throw Error("Invalid goods.");
        }
    }

    public getSellTax(goods: Goods): number {
       
        this.logger.info(`Getting tax for selling ${goods}`);
        switch (goods) {
            case Goods.Coal:
                return 15;
            case Goods.Cheese:
            case Goods.Bikes:
            case Goods.Books:
                return 5;
            default:
                throw Error("Invalid goods.");
        }
    }
}