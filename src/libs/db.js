import { openDB } from "idb";

const DB_NAME = "CampusMapDB";
const STORE_NAME = "projects";
const VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveToIndexedDB(key, value) {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, value, key);
  } catch (err) {
    console.error("Error saving to IndexedDB:", err);
  }
}

export async function loadFromIndexedDB(key) {
  try {
    const db = await getDB();
    return await db.get(STORE_NAME, key);
  } catch (err) {
    console.error("Error loading from IndexedDB:", err);
    return null;
  }
}
