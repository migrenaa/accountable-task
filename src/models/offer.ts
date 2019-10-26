import { OfferType } from "./offerType";
import { ProductType } from "./productType";


/**
 * @swagger
 * definitions:
 *  Offer:
 *      type: object
 *      required:
 *          - inhabitantId
 *          - productType
 *          - type
 *          - amount
 *          - price
 *          - datePlaced
 *      properties:
 *            inhabitantId:
 *              type: string
 *            productType:
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
    inhabitantId: string;
    productType: ProductType;
    type: OfferType;
    price: string;
    amount: number;
    datePlaced: string;
}