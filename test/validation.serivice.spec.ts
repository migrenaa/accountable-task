import "reflect-metadata";
import * as typemoq from "typemoq";
import { expect } from "chai";
import "mocha";
import { ValidationService, LoggerService } from "../src/services";
import { TransactionStorage } from "../src/storages";
import { Inhabitant, Offer, ProductType, OfferType, Transaction } from "../src/models";
import { v4 as uuid } from "uuid";


describe("ValidationService", async () => {
    let validationSerivce: ValidationService;
    let transactionStorage: typemoq.IMock<TransactionStorage>;
    let loggerService: typemoq.IMock<LoggerService>;

    const getTransaction = () => {
        const transaction: Transaction = {
            id: uuid(),
            buyerId: "1",
            buyerName: "b1",
            sellerId: "1",
            sellerName: "s1",
            productType: ProductType.Bikes,
            price: "1",
            amount: 1,
            datePlaced: "2019-1-1",
            dateTraded: "2019-1-2"
        };
        return transaction;
    };


    before(async () => {
        transactionStorage = typemoq.Mock.ofType<TransactionStorage>();
        loggerService = typemoq.Mock.ofType<LoggerService>();

            validationSerivce = new ValidationService(
            loggerService.object,
            transactionStorage.object
        );

    });

    describe("validateSell", async () => {

        it("Should return error when the inhabitant want's to sell more than it has.", async () => {
            const seller: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "0",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Bikes,
                type: OfferType.Sell,
                price: "1",
                amount: 3,
                datePlaced: "2019-1-1"
            };

            const result = await validationSerivce.validateSell(seller, offer)
            expect(result.status, 400);
            expect(result.message, "The wants to sell more than it has from this products.");

        });

        it("Should return error when the inhabitant want's to sell 3 books in a row.", async () => {
            const seller: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "0",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Bikes,
                type: OfferType.Sell,
                price: "1",
                amount: 1,
                datePlaced: "2019-1-1"
            };

            const transaction = getTransaction();

            transactionStorage
                .setup(x => x.getBySellerId(seller.id, 3))
                .returns(() => Promise.resolve([transaction, transaction, transaction]));

            const result = await validationSerivce.validateSell(seller, offer)
            expect(result.status, 400);
            expect(result.message, "The seller can't place an offer for book 3 times in a row.");

        });

        it("Should return success if all checks pass.", async () => {
            const seller: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "0",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Bikes,
                type: OfferType.Sell,
                price: "1",
                amount: 1,
                datePlaced: "2019-1-1"
            };

            const transaction = getTransaction();

            transactionStorage
                .setup(x => x.getBySellerId(seller.id, 3))
                .returns(() => Promise.resolve([transaction]));

            const result = await validationSerivce.validateSell(seller, offer)
            expect(result.status, 200);
            expect(result.message, "Offer can be placed.");
        });
    });



    describe("validateBuy", async () => {

        it("Should return an error if the inhabitant is placing a buy offer with higher price than its balance.", async () => {
            const buyer: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "1",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Bikes,
                type: OfferType.Buy,
                price: "2",
                amount: 3,
                datePlaced: "2019-1-1"
            };

            const result = await validationSerivce.validateBuy(buyer, offer)
            expect(result.status, 400);
            expect(result.message, "The buyer doesn't have enough money.");

        });

        it("Should return an error when an inhabitant places an offer for buying a third bike", async () => {
            const buyer: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "0",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Bikes,
                type: OfferType.Buy,
                price: "1",
                amount: 1,
                datePlaced: "2019-1-1"
            };

            const result = await validationSerivce.validateBuy(buyer, offer)
            expect(result.status, 400);
            expect(result.message, "The buyer can't buy a third bike.");

        });


        it("Should return an error when an inhabitant places an offer for buying coal if he's going to own more than 10 percent of the global market", async () => {
            const buyer: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "0",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Coal,
                type: OfferType.Buy,
                price: "1",
                amount: 1,
                datePlaced: "2019-1-1"
            };

            process.env.GLOBAL_COAL_MARKET = "10";

            const result = await validationSerivce.validateBuy(buyer, offer)
            expect(result.status, 400);
            expect(result.message, "The buyer can't own more than 10 percent of the global coal market.");

        });

        it("Should return an error when an inhabitant places 2 offers for bikes in a row.", async () => {
            const buyer: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "0",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Coal,
                type: OfferType.Buy,
                price: "1",
                amount: 1,
                datePlaced: "2019-1-1"
            };

            process.env.GLOBAL_COAL_MARKET = "1000";

            const transaction = getTransaction();
            transaction.productType = ProductType.Bikes;

            transactionStorage
                .setup(x => x.getByBuyerId(buyer.id, 2))
                .returns(() => Promise.resolve([transaction, transaction]));

            const result = await validationSerivce.validateBuy(buyer, offer)
            expect(result.status, 400);
            expect(result.message, "The buyer can't place an offer for a bike 2 times in a row.");

        });

        it("Should return success if all checks pass.", async () => {
            const buyer: Inhabitant = {
                id: "1",
                name: "inh 1",
                balance: "0",
                products: {
                    bikes: 2,
                    books: 1,
                    cheese: 1,
                    coal: 1
                },
            };

            const offer: Offer = {
                id: "1",
                inhabitantId: "1",
                productType: ProductType.Cheese,
                type: OfferType.Sell,
                price: "1",
                amount: 1,
                datePlaced: "2019-1-1"
            };

            process.env.GLOBAL_COAL_MARKET = "1000";
            const transaction = getTransaction();

            transactionStorage
                .setup(x => x.getBySellerId(buyer.id, 3))
                .returns(() => Promise.resolve([transaction]));

            const result = await validationSerivce.validateBuy(buyer, offer)
            expect(result.status, 200);
            expect(result.message, "Offer can be placed.");
        });
    });
});