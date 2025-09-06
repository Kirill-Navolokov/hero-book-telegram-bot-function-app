import { Db, ObjectId } from "mongodb";
import { TgAccount } from "../models/ tgAccount";
import { BaseRepository } from "./baseRepository";

export class TelegramAccountsRepository extends BaseRepository {
    constructor(db: Db) {
        super(db);
    }

    protected get collectionName(): string {
        return process.env.DB_TG_BAN_COLLECTION!;
    }

    public async isBanned(tgUserId: number): Promise<boolean> {
        const collection = this.getCollection<TgAccount>();
        const account = await collection.findOne(
            {tgUserId: tgUserId},
            {collation: {locale:"en", strength:1}});

        return account != null;
    }

    public async add(tgUserId: number): Promise<void> {
        const collection = this.getCollection<TgAccount>();
        const result =  await collection.insertOne(
            {
                _id: new ObjectId(),
                tgUserId: tgUserId
            },
            {forceServerObjectId: true});
    }

    public async delete(tgUserId: number): Promise<void> {
        const collection = this.getCollection<TgAccount>();
        await collection.deleteOne({tgUserId: tgUserId});
    }
}