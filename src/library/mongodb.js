import { MongoClient } from "mongodb";

const uri = process.env.MongoURL;
if (!uri) {
  throw new Error("❌ MongoDB URL not found in .env.local");
}

const options = {};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
