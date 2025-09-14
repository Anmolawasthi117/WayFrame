import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------- DEFAULTS ----------------
export const defaultNode = {
  nodeId: "",
  name: "",
  type: "room", // room | hallway | stair | elevator
  coordinates: { x: 0, y: 0, floor: "" },
  connections: [], // { nodeId, distance }
  meta: {},
};

export const defaultFloor = {
  id: "",
  name: "",
  level: 0,
  nodes: [defaultNode],
  meta: {},
};

export const defaultConnection = {
  from: "",
  to: "",
  distance: 0,
  type: "stair", // or elevator
  meta: {},
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
  floors: [],
  connections: [], // global inter-floor connections
};

// ---------------- STORE ----------------
export const useProjectStore = create(
  persist(
    (set, get) => ({
      project: defaultProjectSchema,
      activeFloorId: null,
      selectedNodeId: null,

      // ---------------- FLOORS ----------------
      setActiveFloor: (id) => set({ activeFloorId: id }),
      addFloor: (floor) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: [...state.project.floors, { ...defaultFloor, ...floor, nodes: [] }],
          },
        })),

      // ---------------- META ----------------
      updateBuildingMeta: (meta) =>
        set((state) => ({
          project: {
            ...state.project,
            building: {
              ...state.project.building,
              meta: { ...state.project.building.meta, ...meta, updatedAt: new Date().toISOString() },
            },
          },
        })),

      // ---------------- NODES ----------------
      addNode: (floorId, node) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId ? { ...f, nodes: [...f.nodes, { ...defaultNode, ...node }] } : f
            ),
          },
        })),

      updateNode: (floorId, nodeId, updates) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId
                ? {
                    ...f,
                    nodes: f.nodes.map((n) =>
                      n.nodeId === nodeId ? { ...n, ...updates } : n
                    ),
                  }
                : f
            ),
          },
        })),

      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

      // ---------------- CONNECTIONS ----------------
      // intra-floor: push into node.connections
      addLocalConnection: (floorId, fromNodeId, toNodeId, distance = 0) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId
                ? {
                    ...f,
                    nodes: f.nodes.map((n) =>
                      n.nodeId === fromNodeId
                        ? {
                            ...n,
                            connections: [
                              ...n.connections,
                              { nodeId: toNodeId, distance },
                            ],
                          }
                        : n
                    ),
                  }
                : f
            ),
          },
        })),

      // global: cross-floor connections
      addGlobalConnection: (connection) =>
        set((state) => ({
          project: {
            ...state.project,
            connections: [...state.project.connections, { ...defaultConnection, ...connection }],
          },
        })),

      removeGlobalConnection: (from, to) =>
        set((state) => ({
          project: {
            ...state.project,
            connections: state.project.connections.filter(
              (c) => !(c.from === from && c.to === to)
            ),
          },
        })),

      // ---------------- IMPORT / EXPORT ----------------
      importProject: (json) => set({ project: JSON.parse(json) }),
      exportProject: () => {
  const raw = get().project;

  const cleanProject = {
    ...raw,
    floors: raw.floors.map((floor) => ({
      id: floor.id,
      name: floor.name,
      level: floor.level,
      meta: floor.meta || {},
      nodes: floor.nodes.map((node) => ({
        nodeId: node.nodeId,
        name: node.name,
        type: node.type,
        coordinates: { ...node.coordinates },
        // only keep local same-floor connections
        connections: (node.connections || []).map((c) => ({
          nodeId: c.nodeId,
          distance: c.distance ?? 0,
        })),
        meta: node.meta || {},
      })),
    })),
    // keep only true inter-floor connections
    connections: (raw.connections || []).map((c) => ({
      from: c.from,
      to: c.to,
      distance: c.distance ?? 0,
      type: c.type || "stair",
      meta: c.meta || {},
    })),
  };

  return JSON.stringify(cleanProject, null, 2);
},


      // ---------------- RESET ----------------
      reset: () =>
        set({
          project: defaultProjectSchema,
          activeFloorId: null,
          selectedNodeId: null,
        }),
    }),
    { name: "wayframe-project" }
  )
);
