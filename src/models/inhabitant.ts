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


export interface Inhabitant {
    // id: string;
    name: string;
    moneyAmount: string; //use big numbers
    belongings: Belongings;
}

export interface Belongings {
    bikes: number;
    coal: number;
    cheese: number;
    books: number;
}