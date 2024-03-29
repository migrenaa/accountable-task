import { model, Model, Schema, Document } from "mongoose";
import { Inhabitant } from "../models";
import { v4 as uuid } from "uuid";

export interface InhabitantModel extends Inhabitant, Document { }

const inhabitantSchema: Schema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: uuid()
    },
    name: {
        type: String,
        required: true
    },
    balance: {
        type: String,
        required: true
    },
    dateCreted: { 
        type: Date, 
        default: Date.now,
    },
    products: {
        books: {
            type: Number,
            required: true,
            default: 0,
        },
        coal: {
            type: Number,
            required: true,
            default: 0
        },
        bikes: {
            type: Number,
            required: true,
            default: 0
        },
        cheese: {
            type: Number,
            required: true,
            default: 0
        }
    },
});

export const InhabitantSchema: Model<InhabitantModel> = model<InhabitantModel>("Inhabitant", inhabitantSchema);
