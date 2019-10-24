import { model, Model, Schema, Document } from "mongoose";
import { Inhabitant } from "../models";

export interface InhabitantModel extends Inhabitant, Document { }

const inhabitantSchema: Schema = new Schema({
    // id: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    name: {
        type: String,
        required: true
    },
    moneyAmount: {
        type: String,
        required: true
    },
    belongings: {
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
