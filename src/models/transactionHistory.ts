import { ProductType } from "./productType";

export interface Transaction {
    id: string;
    buyerId: string;
    sellerId: string;
    buyerName: string;
    sellerName: string;

    productType: ProductType;
    price: string;
    amount: number;
    datePlaced: string;
    dateTraded: string;
}
