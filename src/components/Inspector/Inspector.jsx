import { useState, useCallback } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { useUiStore } from "../../store/useUiStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { Eye } from "lucide-react";

import InspectorHeader from "./InspectorHeader";
import ProjectOverview from "./ProjectOverview";
import NodeDetails from "./NodeDetails";
import JsonEditorModal from "./JsonEditorModal";

const Inspector = () => {
  // ------------------- STORE -------------------
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const exportProject = useProjectStore((s) => s.exportProject);
  const importProject = useProjectStore((s) => s.importProject);
  const removeNode = useProjectStore((s) => s.removeNode);
  const addLocalConnection = useProjectStore((s) => s.addLocalConnection);
  const removeLocalConnection = useProjectStore((s) => s.removeLocalConnection);
  const addGlobalConnection = useProjectStore((s) => s.addGlobalConnection);
  const removeGlobalConnection = useProjectStore((s) => s.removeGlobalConnection);

  const { selectedNodeId, setSelectedNode } = useUiStore();
  const { saveState, undo, redo, canUndo, canRedo } = useHistoryStore();

  const [showJsonEditor, setShowJsonEditor] = useState(false);

  // ------------------- ACTIVE FLOOR & NODE -------------------
  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);
  const selectedNode = activeFloor?.nodes?.find((n) => n.nodeId === selectedNodeId);

  // ------------------- CLEAN PROJECT FOR JSON EDITOR -------------------
  const getCleanProjectForEditor = useCallback(() => {
    return {
      building: { ...project.building },
      floors: project.floors.map((floor) => ({
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
      connections: (project.connections || []).map((c) => ({
        from: c.from,
        to: c.to,
        type: c.type,
        distance: c.distance ?? 0,
      })),
    };
  }, [project]);

  const openJsonEditor = useCallback(() => setShowJsonEditor(true), []);

  const handleJsonSave = (newSchema) => {
    try {
      const sanitized = {
        building: { ...newSchema.building },
        floors: (newSchema.floors || []).map((f) => ({
          id: f.id,
          name: f.name,
          level: f.level,
          nodes: (f.nodes || []).map((n) => ({
            nodeId: n.nodeId,
            name: n.name,
            type: n.type,
            coordinates: { ...n.coordinates },
            connections: (n.connections || []).map((c) => ({
              nodeId: c.nodeId,
              distance: c.distance ?? 0,
            })),
          })),
        })),
        connections: (newSchema.connections || []).map((c) => ({
          from: c.from,
          to: c.to,
          type: c.type,
          distance: c.distance ?? 0,
        })),
      };

      saveState();
      importProject(JSON.stringify(sanitized));
    } catch (err) {
      alert("Invalid schema update");
    }
  };

  // ------------------- PROJECT STATS -------------------
  const getProjectStats = useCallback(() => {
    const totalNodes =
      project?.floors?.reduce((acc, f) => acc + (f.nodes?.length || 0), 0) || 0;
    const totalConnections = project?.connections?.length || 0;
    const floorCount = project?.floors?.length || 0;
    return { totalNodes, totalConnections, floorCount };
  }, [project]);

  const stats = getProjectStats();

  return (
    <div
      className="
        fixed
        top-0
        right-0
        h-full
        w-80
        bg-white
        border-l
        border-gray-200
        flex
        flex-col
        z-50
      "
    >
      {/* HEADER */}
      <InspectorHeader
        exportProject={exportProject}
        importProject={importProject}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        openJsonEditor={openJsonEditor}
      />

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        <ProjectOverview project={project} stats={stats} />
        {activeFloor && <div className="border-b border-gray-100"></div>}
        {selectedNode ? (
          <NodeDetails
            selectedNode={selectedNode}
            project={project}
            activeFloor={activeFloor}
            saveState={saveState}
            removeNode={removeNode}
            addLocalConnection={addLocalConnection}
            removeLocalConnection={removeLocalConnection}
            addGlobalConnection={addGlobalConnection}
            removeGlobalConnection={removeGlobalConnection}
            setSelectedNode={setSelectedNode}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Eye size={24} className="text-gray-400" />
            </div>
            <div className="text-sm font-medium mb-1">No node selected</div>
            <div className="text-xs text-gray-400">
              Click on a node to view and edit its details
            </div>
          </div>
        )}
      </div>

      {/* JSON SCHEMA EDITOR */}
      <JsonEditorModal
        isOpen={showJsonEditor}
        onClose={() => setShowJsonEditor(false)}
        data={getCleanProjectForEditor()}
        onSave={handleJsonSave}
      />
    </div>
  );
};

export default Inspector;
