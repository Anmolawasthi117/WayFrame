import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------- DEFAULTS ----------------
export const defaultNode = {
  nodeId: "",
  name: "",
  type: "room", // room | hallway | stair | elevator
  coordinates: { x: 0, y: 0, floor: "" },
  connections: [], // { nodeId, distance } - same-floor only
  meta: {},
};

export const defaultFloor = {
  id: "",
  name: "",
  level: 0,
  nodes: [],
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

      addFloor: (floorData) => {
        const cleanFloor = { 
          ...defaultFloor, 
          id: Date.now().toString(), 
          ...floorData 
        };

        set((state) => {
          const updatedFloors = [...state.project.floors, cleanFloor];
          return {
            project: { ...state.project, floors: updatedFloors },
            activeFloorId: cleanFloor.id,
          };
        });

        return cleanFloor.id;
      },

      updateFloor: (floorId, updates) => {
        const { imgUrl, ...cleanUpdates } = updates; // strip UI-only stuff
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId ? { ...f, ...cleanUpdates } : f
            ),
          },
        }));
      },

      removeFloor: (floorId) => {
        set((state) => {
          const updatedFloors = state.project.floors.filter((f) => f.id !== floorId);
          let newActiveId = state.activeFloorId;
          if (state.activeFloorId === floorId) {
            newActiveId = updatedFloors.length ? updatedFloors[0].id : null;
          }
          return {
            project: { ...state.project, floors: updatedFloors },
            activeFloorId: newActiveId,
          };
        });
      },

      // ---------------- NODES ----------------
      addNode: (floorId, node) => {
        const newNode = {
          ...defaultNode,
          ...node,
          nodeId: node.nodeId || crypto.randomUUID(), // always have nodeId
          coordinates: {
            ...defaultNode.coordinates,
            ...node.coordinates,
            floor: floorId,
          },
        };

        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId ? { ...f, nodes: [...f.nodes, newNode] } : f
            ),
          },
        }));
      },

      updateNode: (floorId, nodeId, updates) => {
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
        }));
      },

      removeNode: (floorId, nodeId) => {
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId
                ? { ...f, nodes: f.nodes.filter((n) => n.nodeId !== nodeId) }
                : f
            ),
          },
        }));
      },

      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

      // ---------------- CONNECTIONS ----------------
      // intra-floor: bidirectional in node.connections (same floor only)
      addLocalConnection: (floorId, fromNodeId, toNodeId, distance = 0) => {
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId
                ? {
                    ...f,
                    nodes: f.nodes.map((n) => {
                      if (n.nodeId === fromNodeId) {
                        return {
                          ...n,
                          connections: [
                            ...n.connections,
                            { nodeId: toNodeId, distance },
                          ],
                        };
                      }
                      if (n.nodeId === toNodeId) {
                        return {
                          ...n,
                          connections: [
                            ...n.connections,
                            { nodeId: fromNodeId, distance },
                          ],
                        };
                      }
                      return n;
                    }),
                  }
                : f
            ),
          },
        }));
      },

      removeLocalConnection: (floorId, fromNodeId, toNodeId) => {
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) =>
              f.id === floorId
                ? {
                    ...f,
                    nodes: f.nodes.map((n) => {
                      if (n.nodeId === fromNodeId) {
                        return {
                          ...n,
                          connections: n.connections.filter(
                            (c) => c.nodeId !== toNodeId
                          ),
                        };
                      }
                      if (n.nodeId === toNodeId) {
                        return {
                          ...n,
                          connections: n.connections.filter(
                            (c) => c.nodeId !== fromNodeId
                          ),
                        };
                      }
                      return n;
                    }),
                  }
                : f
            ),
          },
        }));
      },

      // global: cross-floor connections (inter-floor only)
      addGlobalConnection: (from, to, distance = 0, type = "stair") => {
        set((state) => ({
          project: {
            ...state.project,
            connections: [
              ...state.project.connections,
              { from, to, distance, type },
            ],
          },
        }));
      },

      removeGlobalConnection: (from, to) => {
        set((state) => ({
          project: {
            ...state.project,
            connections: state.project.connections.filter(
              (c) => !(c.from === from && c.to === to)
            ),
          },
        }));
      },

      // ---------------- META ----------------
      updateBuildingMeta: (meta) =>
        set((state) => ({
          project: {
            ...state.project,
            building: {
              ...state.project.building,
              meta: { 
                ...state.project.building.meta, 
                ...meta, 
                updatedAt: new Date().toISOString() 
              },
            },
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
              // only keep local same-floor connections (no meta, just essentials)
              connections: (node.connections || []).map((c) => ({
                nodeId: c.nodeId,
                distance: c.distance ?? 0,
              })),
              meta: node.meta || {},
            })),
          })),
          // keep only true inter-floor connections (no extraneous props)
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