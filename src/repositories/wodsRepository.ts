import { inject, injectable } from "inversify";
import { TYPES } from "../ioc/typesMap";
import { MongoClient } from "mongodb";
import { Wod } from "../models/wod";
import { AppConfig } from "../appConfig";

@injectable()
export class WodsRepository {
    constructor(
        @inject(TYPES.MongoClient) private readonly mongo: MongoClient,
        @inject(TYPES.AppConfig) private readonly config: AppConfig) {
    }

    async getRandomWod(): Promise<Wod> {
        const db = this.mongo.db(this.config.DB_NAME);
        const collection = db.collection<Wod>(this.config.DB_WODS_COLLECTION);

        // Use $sample to get 1 random document
        const randomWod = await collection.aggregate<Wod>([{ $sample: { size: 1 } }]).toArray();

        return randomWod[0];
    }
}