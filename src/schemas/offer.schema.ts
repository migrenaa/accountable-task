import { model, Model, Schema, Document } from "mongoose";
import { Offer } from "../models";

export interface OfferModel extends Offer, Document { }

const offerSchema: Schema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
    },   
    userId: {
        type: String,
        required: true,
    },   
    goods: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["buy", "sell"],
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
    isOpen: { 
        type: Boolean, 
        default: true
    },
});

export const OfferSchema: Model<OfferModel> = model<OfferModel>("Offer", offerSchema);
