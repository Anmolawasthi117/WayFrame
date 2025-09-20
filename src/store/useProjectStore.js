import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------- DEFAULTS ----------------
export const defaultNode = {
  nodeId: "",
  name: "",
  type: "room", // room | hallway | stair | elevator
  coordinates: { x: 0, y: 0, floor: "" },
  connections: [],
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
  type: "stair", // stair | elevator
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
  connections: [],
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
        set((state) => {
          const newFloor = {
            ...defaultFloor,
            ...floor,
            id: floor.id || crypto.randomUUID(),
            nodes: [],
          };
          return {
            project: {
              ...state.project,
              floors: [...state.project.floors, newFloor],
            },
            activeFloorId: newFloor.id,
          };
        }),

      removeFloor: (floorId) =>
        set((state) => {
          const floor = state.project.floors.find((f) => f.id === floorId);
          const nodeIdsToRemove = floor ? floor.nodes.map((n) => n.nodeId) : [];

          return {
            project: {
              ...state.project,
              floors: state.project.floors.filter((f) => f.id !== floorId),
              connections: state.project.connections.filter(
                (c) => !nodeIdsToRemove.includes(c.from) && !nodeIdsToRemove.includes(c.to)
              ),
            },
            activeFloorId:
              state.activeFloorId === floorId
                ? state.project.floors[0]?.id || null
                : state.activeFloorId,
            selectedNodeId:
              nodeIdsToRemove.includes(state.selectedNodeId)
                ? null
                : state.selectedNodeId,
          };
        }),

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
                updatedAt: new Date().toISOString(),
              },
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

      removeNode: (floorId, nodeId) =>
        set((state) => {
          const updatedFloors = state.project.floors.map((f) => {
            if (f.id !== floorId) return f;

            return {
              ...f,
              nodes: f.nodes
                .filter((n) => n.nodeId !== nodeId)
                .map((n) => ({
                  ...n,
                  connections: n.connections.filter((c) => c.nodeId !== nodeId),
                })),
            };
          });

          return {
            project: {
              ...state.project,
              floors: updatedFloors,
              connections: state.project.connections.filter(
                (c) => c.from !== nodeId && c.to !== nodeId
              ),
            },
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          };
        }),

      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

      // ---------------- CONNECTIONS ----------------
      addLocalConnection: (floorId, fromNodeId, toNodeId, distance = 0) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) => {
              if (f.id !== floorId) return f;
              return {
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
              };
            }),
          },
        })),

      removeLocalConnection: (floorId, fromNodeId, toNodeId) =>
        set((state) => ({
          project: {
            ...state.project,
            floors: state.project.floors.map((f) => {
              if (f.id !== floorId) return f;
              return {
                ...f,
                nodes: f.nodes.map((n) => {
                  if (n.nodeId === fromNodeId) {
                    return {
                      ...n,
                      connections: n.connections.filter((c) => c.nodeId !== toNodeId),
                    };
                  }
                  if (n.nodeId === toNodeId) {
                    return {
                      ...n,
                      connections: n.connections.filter((c) => c.nodeId !== fromNodeId),
                    };
                  }
                  return n;
                }),
              };
            }),
          },
        })),

      addGlobalConnection: (connection) =>
        set((state) => {
          if (!["stair", "elevator"].includes(connection.type)) {
            console.warn(
              `Rejected global connection: type must be "stair" or "elevator", got "${connection.type}"`
            );
            return state;
          }
          return {
            project: {
              ...state.project,
              connections: [...state.project.connections, { ...defaultConnection, ...connection }],
            },
          };
        }),

      removeGlobalConnection: (from, to) =>
        set((state) => ({
          project: {
            ...state.project,
            connections: state.project.connections.filter((c) => !(c.from === from && c.to === to)),
          },
        })),

      // ---------------- IMPORT / EXPORT ----------------
      importProject: (json) => set({ project: JSON.parse(json) }),

      exportProject: () => {
        const raw = get().project;

        const cleanProject = {
          building: { id: raw.building.id, name: raw.building.name },
          floors: raw.floors.map((floor) => ({
            id: floor.id,
            name: floor.name,
            level: floor.level,
            nodes: floor.nodes.map((node) => ({
              nodeId: node.nodeId,
              name: node.name,
              type: node.type,
              coordinates: { ...node.coordinates },
              connections: (node.connections || []).map((c) => ({
                nodeId: c.nodeId,
                distance: c.distance ?? 0,
              })),
            })),
          })),
          connections: (raw.connections || [])
            .filter((c) => ["stair", "elevator"].includes(c.type))
            .map((c) => ({ from: c.from, to: c.to, distance: c.distance ?? 0, type: c.type })),
        };

        return JSON.stringify(cleanProject, null, 2);
      },

      // ---------------- RESET ----------------
      reset: () =>
        set({ project: defaultProjectSchema, activeFloorId: null, selectedNodeId: null }),
    }),
    { name: "wayframe-project" }
  )
);
