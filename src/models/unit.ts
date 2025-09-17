import { ObjectId } from "mongodb";

export interface Unit {
    _id: ObjectId;
    name: string;
    description?: string;
    type?: number;
    foundationDate?: Date;
    isPublished: boolean;
    socialNetworks?: {[type: number]: string},
    otp: string;
    passedSignUp: boolean;
    adminContact: {
        tgUserId: number;
        email: string;
    }
}