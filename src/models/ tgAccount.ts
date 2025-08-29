import { ObjectId } from "mongodb";

export interface TgAccount {
    _id: ObjectId;
    tgUserId: number;
}