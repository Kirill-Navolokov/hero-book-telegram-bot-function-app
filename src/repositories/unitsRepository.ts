import { Db, ObjectId } from "mongodb"
import { BaseRepository } from "./baseRepository"
import { UnitRegistration } from "../models/unitRegistration";
import { Unit } from "../models/unit";

export class UnitsRepository extends BaseRepository {
    constructor(db: Db) {
        super(db);
    }

    protected get collectionName(): string {
        return process.env.DB_UNITS_COLLECTION!;
    }

    public async createUnitFromRequest(request: UnitRegistration): Promise<Unit> {
        let unit: Unit = {
            _id: new ObjectId(),
            isPublished: false,
            name: request.name,
            adminContact: {
                tgUserId: request.userId!,
                email: request.adminEmail
            }
        }

        const collection = this.getCollection<Unit>();
        const result = await collection.insertOne(unit, {forceServerObjectId: true});
        unit._id = result.insertedId;

        return unit;
    }

    public async getUnitByAdminTgId(userId: number): Promise<Unit | null> {
        const collection = this.getCollection<Unit>();
        const result = await collection.findOne({'adminContact.tgUserId': userId});

        return result;
    }
}