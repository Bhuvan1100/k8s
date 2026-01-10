import { MeiliSearch } from "meilisearch";

export const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST || "http://localhost:7700"
});

console.log(" Meilisearch client initialized");
