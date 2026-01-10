import { meiliClient } from "../infra/meilisearch.js";

async function setup() {
  console.log("Setting up Meilisearch products index...");

  await meiliClient.createIndex("products", {
    primaryKey: "id"
  }).catch(() => {
    console.log("Index already exists");
  });

  await meiliClient.index("products").updateSearchableAttributes([
    "title",
    "description",
    "category"
  ]);

  await meiliClient.index("products").updateFilterableAttributes([
    "category",
    "isActive",
    "availableSizes"
  ]);

  await meiliClient.index("products").updateSortableAttributes([
    "createdAt"
  ]);

  console.log("Meilisearch products index ready");
}

setup()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Meilisearch setup failed", err);
    process.exit(1);
  });
