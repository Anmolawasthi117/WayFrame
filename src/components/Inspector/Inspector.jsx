import { useState, useCallback } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { useNodeStore } from "../../store/useNodeStore";
import { useConnectionStore } from "../../store/useConnectionStore";
import { useUiStore } from "../../store/useUiStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { Eye } from "lucide-react";

import InspectorHeader from "./InspectorHeader";
import ProjectOverview from "./ProjectOverview";
import NodeDetails from "./NodeDetails";
import JsonEditorModal from "./JsonEditorModal";

const Inspector = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const exportProject = useProjectStore((s) => s.exportProject);
  const importProject = useProjectStore((s) => s.importProject);

  const { removeNode } = useNodeStore();
  const { removeConnection } = useConnectionStore();
  const { selectedNodeId, setSelectedNode } = useUiStore();
  const { saveState, undo, redo, canUndo, canRedo } = useHistoryStore();

  const [showJsonEditor, setShowJsonEditor] = useState(false);

  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);
  const selectedNode = activeFloor?.nodes?.find((n) => n.id === selectedNodeId);

  // open modal with current schema
  const openJsonEditor = useCallback(() => {
    setShowJsonEditor(true);
  }, []);

  // save schema from modal
  const handleJsonSave = (newSchema) => {
    try {
      saveState();
      importProject(JSON.stringify(newSchema));
    } catch (err) {
      alert("Invalid schema update");
    }
  };

  // stats for overview
  const getProjectStats = useCallback(() => {
    const totalNodes =
      project?.floors?.reduce((acc, floor) => acc + (floor.nodes?.length || 0), 0) || 0;
    const totalConnections = project?.connections?.length || 0;
    const floorCount = project?.floors?.length || 0;
    return { totalNodes, totalConnections, floorCount };
  }, [project]);

  const stats = getProjectStats();

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <InspectorHeader
        exportProject={exportProject}
        importProject={importProject}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        openJsonEditor={openJsonEditor}
      />

      {/* Body */}
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
            removeConnection={removeConnection}
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

      {/* JSON Schema Editor Modal */}
      <JsonEditorModal
        isOpen={showJsonEditor}
        onClose={() => setShowJsonEditor(false)}
        data={project}
        onSave={handleJsonSave}
      />
    </div>
  );
};

export default Inspector;
