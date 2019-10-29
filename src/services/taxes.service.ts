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
        const sellerTaxes = await this.calculateSellTax(seller, offer);

        this.logger.info(`Buyer taxes: ${buyerTaxes} and seller taxes: ${sellerTaxes}`);
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

    private async calculateSellTax(seller: Inhabitant, offer: Offer): Promise<string> {
        const bikesTaxDiscount = Big(seller.products.bikes).mul(0.05);
        const taxCalculation = Big(this.getSellTax(offer.productType)).minus(bikesTaxDiscount);
        const tax = taxCalculation.gt(0) ? taxCalculation.toString() : "0";
        return Big(offer.price).mul(tax).toString();
    }

    private async calculateBuyTax(buyer: Inhabitant, offer: Offer): Promise<string> {

        let taxPercent: string;
        taxPercent = this.getBuyTax(offer.productType);
        if (offer.productType === ProductType.Books) {
            const taxForHavingCoal = Big(buyer.products.coal).mul(0.05);
            taxPercent = taxForHavingCoal.lt(0.5) ? taxForHavingCoal.toString() : "0.5";
        }

        const tax = Big(offer.price).mul(taxPercent).toString();
        this.logger.info(`buy tax for offer ${offer}`);
        return tax;
    }

    private getBuyTax(productType: ProductType): string {

        this.logger.info(`Getting tax for buying ${productType}`);
        switch (productType) {
            case ProductType.Coal:
                return "0.75";
            case ProductType.Cheese:
            case ProductType.Bikes:
                return "0.15";
            case ProductType.Books:
                return "0";
            default:
                throw Error("Invalid ProductType.");
        }
    }

    private getSellTax(productType: ProductType): string {

        this.logger.info(`Getting tax for selling ${productType}`);
        switch (productType) {
            case ProductType.Coal:
                return "0.15";
            case ProductType.Cheese:
            case ProductType.Bikes:
            case ProductType.Books:
                return "0.05";
            default:
                throw Error("Invalid ProductType.");
        }
    }
}