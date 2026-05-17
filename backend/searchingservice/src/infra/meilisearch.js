import { MeiliSearch } from "meilisearch";

const MEILI_HOST = process.env.MEILI_HOST || "meilisearch";
const MEILI_PORT = process.env.MEILI_PORT || "7700";
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || "";

export const meiliClient = new MeiliSearch({
  host: `http://${MEILI_HOST}:${MEILI_PORT}`,
  apiKey: MEILI_MASTER_KEY,
});

console.log("Meilisearch client initialized");
