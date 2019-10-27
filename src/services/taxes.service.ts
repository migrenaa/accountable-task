import { LoggerService } from "../services";
import { InhabitantStorage, GovermentBankAccountStorage } from "../storages";
import { Offer, Inhabitant, ProductType } from "../models";
import { injectable } from "inversify";
import { Big } from "big.js";
@injectable()
export class TaxesService {

    constructor(
        private logger: LoggerService,
        private inhabitantStorage: InhabitantStorage,
        private bankStorage: GovermentBankAccountStorage) {
    }

    public async applyTaxes(seller: Inhabitant, buyer: Inhabitant, offer: Offer) {

        this.logger.info(`Applying taxes for offer ${offer.id}`);

        const buyerTaxes = await this.calculateBuyTax(buyer, offer);
        const sellerTaxes = await this.calculateBuyTax(seller, offer);
        buyer.balance = Big(buyer.balance).minus(buyerTaxes).toString();

        this.logger.info(`Updating buyer ${buyer.id} balance with ${buyer.balance}`);
        await this.inhabitantStorage.update(buyer);

        seller.balance = Big(seller.balance).minus(sellerTaxes).toString();
        this.logger.info(`Updating seller ${seller.id} balance with ${seller.balance}`);
        await this.inhabitantStorage.update(seller);

        this.logger.info("Updating bank balance");
        const bankAccountBalance = await this.bankStorage.get();
        this.logger.info(`Bank Account Balance: ${bankAccountBalance.balance}`);
        const newBalance = Big(bankAccountBalance.balance).plus(sellerTaxes).plus(buyerTaxes);
        await this.bankStorage.updateBalance(newBalance.toString());
    }

    public async calculateSellTax(seller: Inhabitant, offer: Offer): Promise<string> {
        const taxCalculation = this.getSellTax(offer.productType) - seller.products.bikes * 5
        const tax = taxCalculation > 0 ? taxCalculation : 0;
        return Big(offer.amount).mul(tax).div(100).toString();
    }

    public async calculateBuyTax(buyer: Inhabitant, offer: Offer): Promise<string> {

        let taxPercent;
        taxPercent = this.getBuyTax(offer.productType);
        if (offer.productType === ProductType.Books) {
            const taxForHavingCoal = buyer.products.coal * 5;
            taxPercent = taxForHavingCoal < 50 ? taxForHavingCoal : 50;
        }
        return Big(offer.amount).mul(taxPercent).div(100).toString();
    }

    public getBuyTax(productType: ProductType): number {

        this.logger.info(`Getting tax for buying ${ProductType}`);
        switch (productType) {
            case ProductType.Coal:
                return 75;
            case ProductType.Cheese:
            case ProductType.Bikes:
                return 15;
            case ProductType.Books:
                return 0;
            default:
                throw Error("Invalid ProductType.");
        }
    }

    public getSellTax(productType: ProductType): number {

        this.logger.info(`Getting tax for selling ${ProductType}`);
        switch (productType) {
            case ProductType.Coal:
                return 15;
            case ProductType.Cheese:
            case ProductType.Bikes:
            case ProductType.Books:
                return 5;
            default:
                throw Error("Invalid ProductType.");
        }
    }
}