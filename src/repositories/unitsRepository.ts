import { Db } from "mongodb";
import { UnitRegistration } from "../models/unitRegistration";

export class UnitsRepository {
    constructor(private readonly db: Db) {
    }

    public async addUnitRequest(registrationRequest: UnitRegistration): Promise<UnitRegistration> {
        const collection = this.db.collection(process.env.DB_UNIT_REQUESTS_COLLECTION!);
        var result =  await collection.insertOne(registrationRequest, {forceServerObjectId: true});
        registrationRequest._id = result.insertedId;

        return registrationRequest;
    }

    public async userRequestExists(userId: number): Promise<boolean> {
        const collection = this.db.collection<UnitRegistration>(process.env.DB_UNIT_REQUESTS_COLLECTION!);
        const uniRegistration = await collection.findOne({userId: userId});
        
        return uniRegistration != null;
    }

}