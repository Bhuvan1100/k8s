import { MeiliSearch } from "meilisearch"

export const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST || "http://meilisearch:7700",
  apiKey: process.env.MEILI_MASTER_KEY,
})

console.log("Meilisearch client initialized")
