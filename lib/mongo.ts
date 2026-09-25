// lib/mongo.ts — cached MongoDB connection (driver: mongodb).
// MONGODB_URI lives in .env.local (never commit it). Files stay the backup/export format.

import { MongoClient, type Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __mayajaalMongo: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var __mayajaalSeed: Promise<void> | undefined;
}

function connectClient(): Promise<MongoClient> {
  const URI = process.env.MONGODB_URI;
  if (!URI) {
    // lazy check: keeps `next build` working without the env var
    throw new Error(
      "MONGODB_URI is not set — add it to studio/.env.local (see .env.example / README Phase 2)"
    );
  }
  // global cache: survives HMR and route-module reloads in dev
  if (!global.__mayajaalMongo) {
    global.__mayajaalMongo = new MongoClient(URI).connect();
  }
  return global.__mayajaalMongo;
}

export async function getDb(): Promise<Db> {
  const client = await connectClient();
  return client.db(); // db name comes from the URI's /path segment
}

export const collections = {
  stories: "stories",
  scripts: "scripts",
  prompts: "prompts",
  tracker: "tracker",
  lintRuns: "lintRuns",
} as const;
