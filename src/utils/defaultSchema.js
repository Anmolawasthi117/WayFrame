// src/utils/defaultSchema.js

export const defaultFloor = {
  id: "",
  name: "",
  level: 0, // floor number (G=0, 1, 2, ...)
  imageUrl: "", // base64 or URL
  nodes: [],
};

export const defaultNode = {
  nodeId: "",
  name: "",
  coordinates: {
    x: 0,
    y: 0,
    floor: 0,
  },
  type: "room", // can be: room, hallway, stair, elevator
  connections: [],
  meta: {}, // keep it open for user-defined data
};

export const defaultConnection = {
  from: "", // nodeId
  to: "",   // nodeId
  distance: 0,
};

export const defaultProjectSchema = {
  building: {
    id: "default_building",
    name: "New Project",
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  floors: [defaultFloor],
  connections: [defaultConnection],
};
