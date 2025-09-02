import { ObjectId } from "mongodb";

export interface UnitRegistration {
    _id: ObjectId;
    userId: number;
    chatId: number;
    userName: string;
    request: string;
}