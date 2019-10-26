import { OfferType } from "./offerType";
import { Goods } from "./goods";


/**
 * @swagger
 * definitions:
 *  Offer:
 *      type: object
 *      required:
 *          - userId
 *          - goods
 *          - type
 *          - amount
 *          - price
 *          - datePlaced
 *      properties:
 *            userId:
 *              type: string
 *            goods:
 *              type: string
 *            type:
 *              type: string
 *            amount:
 *              type: number
 *            datePlaced:
 *              type: string
 *            price: 
 *              type: string
 */
export interface Offer {
    id: string;
    userId: string;
    goods: Goods;
    type: OfferType;
    price: string;
    amount: number;
    datePlaced: string;
}
