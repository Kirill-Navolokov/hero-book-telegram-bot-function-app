import { ObjectId } from "mongodb";

export interface UnitRegistration {
    _id?: ObjectId;
    userId?: number;
    chatId?: number;
    name: string;
    adminEmail: string;
    instagramUrl: string;
    telegramChannel?: string;
}