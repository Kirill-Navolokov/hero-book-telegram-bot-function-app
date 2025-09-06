import { Db, ObjectId } from "mongodb";
import { UnitRegistration } from "../models/unitRegistration";
import { BaseRepository } from "./baseRepository";

export class UnitRegistrationsRepository extends BaseRepository {
    constructor(db: Db) {
        super(db);
    }

    protected get collectionName(): string {
        return process.env.DB_UNIT_REQUESTS_COLLECTION!;
    }

    public async add(registrationRequest: UnitRegistration): Promise<UnitRegistration> {
        const collection = this.getCollection<UnitRegistration>();
        const result =  await collection.insertOne(
            registrationRequest,
            {forceServerObjectId: true});
        registrationRequest._id = result.insertedId;

        return registrationRequest;
    }

    public async get(id: ObjectId): Promise<UnitRegistration> {
        const collection = this.getCollection<UnitRegistration>();
        const registration =  await collection.findOne({_id: id});

        return registration!;
    }

    public delete(id: ObjectId): Promise<any> {
        const collection = this.getCollection<UnitRegistration>();

        return collection.deleteOne({_id: new ObjectId(id)});
    }

    public async requestFromUserExists(userId: number): Promise<boolean> {
        const collection = this.getCollection<UnitRegistration>();
        const uniRegistration = await collection.findOne({userId: userId});

        return uniRegistration != null;
    }
}