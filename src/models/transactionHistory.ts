

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
export interface Transaction {
    id: string;
    buyerId: string;
    sellerId: string;
    buyerName: string;
    sellerName: string;

    goods: string;
    price: string;
    amount: number;
    datePlaced: string;
    dateTraded: string;
}
