import { ObjectId } from "mongodb";

export interface Unit {
    _id: ObjectId;
    name: string;
    isPublished: boolean;
    adminId: ObjectId;
}