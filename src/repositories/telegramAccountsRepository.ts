import { Db } from "mongodb";
import { TgAccount } from "../models/ tgAccount";

export class TelegramAccountsRepository {
    constructor(private readonly db: Db) {
    }

    public async isBanned(tgUserId: number): Promise<boolean> {
        const collection = this.db.collection<TgAccount>(process.env.DB_TG_BAN_COLLECTION!);
        const account = await collection.findOne(
            {tgUserId: tgUserId},
            {collation: {locale:"en", strength:1}});

        return account != null;
    }

    public async ban(tgUserId: number): Promise<void> {
    }

    public async unban(tgUserId: number): Promise<void> {
    }
}