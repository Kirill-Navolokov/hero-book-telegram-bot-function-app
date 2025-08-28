import { inject, injectable } from "inversify";
// import { TYPES } from "../ioc/typesMap";
import { Db, MongoClient } from "mongodb";
import { Wod } from "../models/wod";
import { AppConfig } from "../appConfig";

//@injectable()
export class WodsRepository {
    private readonly db: Db;

    constructor(
        // @inject(TYPES.MongoClient) private readonly mongo: MongoClient,
        // @inject(TYPES.AppConfig) private readonly config: AppConfig
        mongo: Db,
    ) {
        this.db = mongo;
    }

    async getRandomWod(): Promise<Wod> {
        const collection = this.db.collection<Wod>(process.env.DB_WODS_COLLECTION!);

        // Use $sample to get 1 random document
        const randomWod = await collection.aggregate<Wod>([{ $sample: { size: 1 } }]).toArray();

        return randomWod[0];
    }
}