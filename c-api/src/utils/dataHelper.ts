import {Db, MongoClient} from "mongodb";
export async function jsonToMongo(json: any[], collectionName: string) {
  const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING || "mongodb://localhost:27017/cola");
  await client.connect();

  const db: Db = client.db(process.env.DB_NAME || "cola");

  await db.collection(collectionName).insertMany(json);

  return;
}