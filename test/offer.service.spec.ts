import "reflect-metadata";
import * as typemoq from "typemoq";
import { expect } from "chai";
import "mocha";
import { ValidationService, LoggerService, OfferService, TaxesService } from "../src/services";
import { OfferStorage, InhabitantStorage, TransactionStorage } from "../src/storages";
import { Offer, ProductType, Transaction, Inhabitant, ResponseModel } from "../src/models";
import { v4 as uuid } from "uuid";
import { Times } from "typemoq";


describe("OfferService", async () => {
    let offerService: OfferService;
    let offerStorage: typemoq.IMock<OfferStorage>;
    let inhabitantStorage: typemoq.IMock<InhabitantStorage>;
    let validationSerivce: typemoq.IMock<ValidationService>;
    let taxesSerivce: typemoq.IMock<TaxesService>;
    let loggerService: typemoq.IMock<LoggerService>;
    let transactionStorage: typemoq.IMock<TransactionStorage>

    before(async () => {
        offerStorage = typemoq.Mock.ofType<OfferStorage>();
        inhabitantStorage = typemoq.Mock.ofType<InhabitantStorage>();
        validationSerivce = typemoq.Mock.ofType<ValidationService>();
        taxesSerivce = typemoq.Mock.ofType<TaxesService>();
        loggerService = typemoq.Mock.ofType<LoggerService>();
        transactionStorage = typemoq.Mock.ofType<TransactionStorage>();

        offerService = new OfferService(
            loggerService.object,
            offerStorage.object,
            inhabitantStorage.object,
            validationSerivce.object,
            taxesSerivce.object,
            transactionStorage.object
        );
    });

    const getInhabitant = (id: string): Inhabitant => {
        return {
            id: id,
            name: "Milena",
            balance: "10",
            products: {
                bikes: 1,
                books: 1,
                coal: 1,
                cheese: 1
            }
        };
    }

    describe("trade", async () => {

        it("Should return error if the inhabitant is trying to accept its own offer.", async () => {
            const buyerId = "buyerId";
            const offerId = "offerId";
            const offer = {
                inhabitantId: buyerId
            };
            offerStorage
                .setup(x => x.getByID(offerId))
                .returns(() => Promise.resolve(offer as Offer));

            const result = await offerService.trade(buyerId, offerId);
            expect(result.status, 400);
            expect(result.message, "The inhabitant can't accept it's own offers.");
        });

        it("Shouldn't apply taxes and close the offer if the validation of the seller fails.", async () => {
            const buyerId = "buyerId";
            const sellerId = "sellerId";
            const seller = getInhabitant(sellerId);
            const buyer = getInhabitant(buyerId);
            const offerId = "offerId";
            const offer = {
                inhabitantId: sellerId
            } as Offer;
            offerStorage
                .setup(x => x.getByID(offerId))
                .returns(() => Promise.resolve(offer as Offer));

            inhabitantStorage
                .setup(x => x.getByID(buyerId))
                .returns(() => Promise.resolve(buyer));

            inhabitantStorage
                .setup(x => x.getByID(sellerId))
                .returns(() => Promise.resolve(seller));

            validationSerivce
                .setup(x => x.validateSell(seller, offer))
                .returns(() => Promise.resolve({ status: 400 } as ResponseModel));

            validationSerivce
                .setup(x => x.validateBuy(buyer, offer))
                .returns(() => Promise.resolve({ status: 200 } as ResponseModel));

            const result = await offerService.trade(buyerId, offerId);

            taxesSerivce.verify(x => x.applyTaxes(seller, buyer, offer), Times.never());
            offerStorage.verify(x => x.closeOffer(offer), Times.never());
            expect(result.status, 400);
        });

        it("Shouldn't apply taxes and close the offer if the validation of the buyer fails.", async () => {
            const buyerId = "buyerId";
            const sellerId = "sellerId";
            const seller = getInhabitant(sellerId);
            const buyer = getInhabitant(buyerId);
            const offerId = "offerId";
            const offer = {
                inhabitantId: sellerId
            } as Offer;
            offerStorage
                .setup(x => x.getByID(offerId))
                .returns(() => Promise.resolve(offer as Offer));

            inhabitantStorage
                .setup(x => x.getByID(buyerId))
                .returns(() => Promise.resolve(buyer));

            inhabitantStorage
                .setup(x => x.getByID(sellerId))
                .returns(() => Promise.resolve(seller));

            validationSerivce
                .setup(x => x.validateBuy(buyer, offer))
                .returns(() => Promise.resolve({ status: 400 } as ResponseModel));

            const result = await offerService.trade(buyerId, offerId);

            taxesSerivce.verify(x => x.applyTaxes(seller, buyer, offer), Times.never());
            offerStorage.verify(x => x.closeOffer(offer), Times.never());
            expect(result.status, 400);
        });

        // it("Should apply taxes and close the offer if the validations pass.", async () => {
        //     const buyerId = "buyerId";
        //     const sellerId = "sellerId";
        //     const seller = getInhabitant(sellerId);
        //     const buyer = getInhabitant(buyerId);
        //     const offerId = "offerId";
        //     const offer = {
        //         inhabitantId: sellerId
        //     } as Offer;

        //     offerStorage
        //         .setup(x => x.getByID(offerId))
        //         .returns(() => Promise.resolve(offer as Offer));

        //     inhabitantStorage
        //         .setup(x => x.getByID(buyerId))
        //         .returns(() => Promise.resolve(buyer));

        //     inhabitantStorage
        //         .setup(x => x.getByID(sellerId))
        //         .returns(() => Promise.resolve(seller));

        //     validationSerivce
        //         .setup(x => x.validateBuy(buyer, offer))
        //         .returns(() => Promise.resolve({ status: 200 } as ResponseModel));


        //     validationSerivce
        //         .setup(x => x.validateSell(seller, offer))
        //         .returns(() => Promise.resolve({ status: 200 } as ResponseModel));

        //     taxesSerivce.setup(x => x.applyTaxes(seller, buyer, offer));
        //     offerStorage.setup(x => x.closeOffer(offer));
        //     const result = await offerService.trade(buyerId, offerId);

        //     taxesSerivce.verify(x => x.applyTaxes(seller, buyer, offer), Times.once());
        //     offerStorage.verify(x => x.closeOffer(offer), Times.once());
        //     expect(result.status, 200);
        //     expect(result.message, "The trade passed successfully.");
        // });
    });
});