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

    // public createUnitFromRequest(request: UnitRegistration): Promise<Unit> {
    //     request.
    //     let unit: Unit = {
    //         _id: new ObjectId(),
    //         isPublished: false,
    //         name
    //     }

    //     const collection = this.getCollection();
    //     unit = await collection.insertOne(unit, {forceServerObjectId: true});

    // }
}