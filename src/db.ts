import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  if (!client) {
    client = new MongoClient(process.env.MONGO_CONNECTION_STRING!, {
      maxPoolSize: 10, // helps control connections in Lambda
    });
    await client.connect();
  }

  db = client.db(process.env.DB_NAME);
  return db;
}