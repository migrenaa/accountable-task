import { model, Model, Schema, Document } from "mongoose";
import { GovermentBankAccount } from "../models";

export interface GovermentBankAccountModel extends GovermentBankAccount, Document { }

const govermentBankAccountSchema: Schema = new Schema({
    balance: {
        type: String,
        required: true,
        default: 0
    },
    dateUpdated: {
        type: Date,
        default: Date.now,
    },
});

export const GovermentBankAccountSchema: Model<GovermentBankAccountModel> =
    model<GovermentBankAccountModel>("GovermentBankAccount", govermentBankAccountSchema);
