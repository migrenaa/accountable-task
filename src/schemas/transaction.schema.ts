import { model, Model, Schema, Document } from "mongoose";
import { Transaction } from "../models";

export interface TransactionModel extends Transaction, Document { }

const transactionSchema: Schema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
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
    goods: {
        type: String,
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
