

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
 *              type: string
 *            datePlaced:
 *              type: string
 *            price: 
 *              type: string
 */
export interface Offer {
    id: string;
    userId: string;
    goods: string;
    type: string;
    price: string;
    amount: string;
    datePlaced: string;
}
