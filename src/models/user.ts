import { ObjectId } from "mongodb";
import { RoleType } from "./roleType";

export interface User {
    _id: ObjectId,
    email: string;
    passedSignUp: boolean,
    otp?: string,
    encryptedPassword?: string;
    roles: RoleType[],
    tgUserId?: number
}