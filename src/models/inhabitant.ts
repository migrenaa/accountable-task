/**
 * @swagger
 * definitions:
 *  CreateInhabitantModel:
 *      type: object
 *      required:
 *          - name
 *          - moneyAmount
 *      properties:
 *            name:
 *              type: string
 *            moneyAmount:
 *              type: string
 */
export interface CreateInhabitantModel {
    name: string;
    moneyAmount: string;
}

/**
 * @swagger
 * definitions:
 *  Inhabitant:
 *      type: object
 *      required:
 *          - name
 *          - moneyAmount
 *          - belongings
 *      properties:
 *            name:
 *              type: string
 *            moneyAmount:
 *              type: string
 *            belongings: 
 *              $ref: '#/definitions/Belongings'
 */
export interface Inhabitant {
    id: string;
    name: string;
    moneyAmount: string; //use big numbers
    belongings: Belongings;
}


/**
 * @swagger
 * definitions:
 *  Belongings:
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
export interface Belongings {
    bikes: number;
    coal: number;
    cheese: number;
    books: number;
}