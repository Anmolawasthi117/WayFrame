// ---------------- NODE ----------------
export const defaultNode = {
  nodeId: "",         // unique per node
  name: "",           // human-friendly label
  type: "room",       // "room" | "hallway" | "stair" | "elevator" | ...
  coordinates: {
    x: 0,
    y: 0,
    floor: "",        // floor id this node belongs to
  },
  connections: [
    {
      nodeId: "",     // connected nodeId (same floor)
      distance: 0,    // weight / distance
    },
  ],
  meta: {},           // open-ended custom metadata
};

// ---------------- FLOOR ----------------
export const defaultFloor = {
  id: "",             // floor id (string)
  name: "",           // display name
  level: 0,           // numeric index or order
  nodes: [defaultNode],
  meta: {},           // optional floor-level metadata (image, blueprint, etc.)
};

// ---------------- GLOBAL CONNECTION ----------------
export const defaultConnection = {
  from: "",           // nodeId (on any floor)
  to: "",             // nodeId (on any floor)
  distance: 0,
  type: "stair",      // "stair" | "elevator" | etc.
  meta: {},           // keep open for extensibility
};

// ---------------- PROJECT ----------------
export const defaultProjectSchema = {
  building: {
    id: "default_building",
    name: "New Project",
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  floors: [defaultFloor],           // multiple floors with independent graphs
  connections: [defaultConnection], // global connections linking floors
};
