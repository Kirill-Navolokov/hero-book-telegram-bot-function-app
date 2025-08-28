import { Db } from "mongodb";
import { Wod } from "../models/wod";

export class WodsRepository {
    private readonly db: Db;

    constructor(mongo: Db) {
        this.db = mongo;
    }

    async getRandomWod(): Promise<Wod> {
        const collection = this.db.collection<Wod>(process.env.DB_WODS_COLLECTION!);
        const count = await collection.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        const randomWod = await collection.find().skip(randomIndex).limit(1).toArray();

        return randomWod[0];
    }
}