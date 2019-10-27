/**
 * @swagger
 * definitions:
 *  CreateInhabitantModel:
 *      type: object
 *      required:
 *          - name
 *          - balance
 *      properties:
 *            name:
 *              type: string
 *            balance:
 *              type: string
 */
export interface CreateInhabitantModel {
    name: string;
    balance: string;
}

/**
 * @swagger
 * definitions:
 *  Inhabitant:
 *      type: object
 *      required:
 *          - name
 *          - balance
 *          - products
 *      properties:
 *            name:
 *              type: string
 *            balance:
 *              type: string
 *            products: 
 *              $ref: '#/definitions/Products'
 */
export interface Inhabitant {
    id: string;
    name: string;
    balance: string; //use big numbers
    products: Products;
}


/**
 * @swagger
 * definitions:
 *  Products:
 *      type: object
 *      required:
 *          - bikes
 *          - coal
 *          - cheese
 *          - books
 *      properties:
 *            bikes:
 *              type: number
 *            coal:
 *              type: number
 *            cheese:
 *              type: number
 *            books:
 *              type: number
 */
export interface Products {
    bikes: number;
    coal: number;
    cheese: number;
    books: number;
}