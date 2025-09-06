import { Db } from "mongodb";
import { Wod } from "../models/wod";
import { BaseRepository } from "./baseRepository";

export class WodsRepository extends BaseRepository {
    constructor(db: Db) {
        super(db);
    }

    protected get collectionName(): string {
        return process.env.DB_WODS_COLLECTION!;
    }

    async getRandomWod(): Promise<Wod> {
        const collection = this.getCollection<Wod>();
        const count = await collection.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomWod = await collection.find().skip(randomIndex).limit(1).toArray();

        return randomWod[0];
    }
}