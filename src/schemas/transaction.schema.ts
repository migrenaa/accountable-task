import { model, Model, Schema, Document } from "mongoose";
import { Transaction } from "../models";
import { v4 as uuid } from "uuid";

export interface TransactionModel extends Transaction, Document { }

const transactionSchema: Schema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: uuid()
    },
    buyerId: {
        type: String,
        required: true,
    }, 
    buyerName: {
        type: String,
        required: true,
    }, 
    sellerId: {
        type: String,
        required: true,
    },   
    sellerName: {
        type: String,
        required: true,
    },   
    productType: {
        type: String,
        enum: ["books", "bikes", "coal", "cheese"],
        required: true
    },
    price: { 
        type: String, 
        required: true
    },
    amount: { 
        type: String, 
        required: true
    },
    datePlaced: { 
        type: Date, 
        default: Date.now,
    },
    dateTraded: { 
        type: Date, 
        default: Date.now,
    },
});

export const TransactionSchema: Model<TransactionModel> = model<TransactionModel>("Transaction", transactionSchema);
