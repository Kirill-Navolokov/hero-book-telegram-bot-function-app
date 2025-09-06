import { Collection, Db } from "mongodb";

export abstract class BaseRepository {
    constructor(private readonly db: Db) {
    }

    protected abstract get collectionName(): string;

    protected getCollection<T extends object>(): Collection<T> {
        return this.db.collection<T>(this.collectionName);
    }
}