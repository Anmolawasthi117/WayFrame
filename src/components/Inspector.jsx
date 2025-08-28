import { useState, useCallback } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useNodeStore } from "../store/useNodeStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useUiStore } from "../store/useUiStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { 
  Eye, EyeOff, Edit3, Trash2, Code, Download, Upload, 
  Save, Copy, CheckCircle, AlertCircle, Info 
} from "lucide-react";

const Inspector = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const updateMeta = useProjectStore((s) => s.updateMeta);
  const exportProject = useProjectStore((s) => s.exportProject);
  const importProject = useProjectStore((s) => s.importProject);
  
  const { updateNode, removeNode } = useNodeStore();
  const { removeConnection } = useConnectionStore();
  const { selectedNodeId, setSelectedNode } = useUiStore();
  const { saveState, undo, redo, canUndo, canRedo } = useHistoryStore();

  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);

  const activeFloor = project?.floors?.find((f) => f.id === activeFloorId);
  const selectedNode = activeFloor?.nodes?.find((n) => n.id === selectedNodeId);

  // Export project with feedback
  const handleExport = useCallback(() => {
    try {
      const projectJson = exportProject();
      const blob = new Blob([projectJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.building?.name || 'wayframe-project'}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setExportStatus({ type: 'success', message: 'Project exported successfully!' });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      setExportStatus({ type: 'error', message: 'Export failed. Please try again.' });
      setTimeout(() => setExportStatus(null), 3000);
    }
  }, [exportProject, project.building?.name]);

  // Import project with validation
  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target.result;
        JSON.parse(jsonContent); // Validate JSON
        saveState(); // Save current state before import
        importProject(jsonContent);
        setExportStatus({ type: 'success', message: 'Project imported successfully!' });
        setTimeout(() => setExportStatus(null), 3000);
      } catch (error) {
        setExportStatus({ type: 'error', message: 'Invalid project file. Please check the format.' });
        setTimeout(() => setExportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, [importProject, saveState]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setExportStatus({ type: 'success', message: 'Copied to clipboard!' });
      setTimeout(() => setExportStatus(null), 2000);
    } catch (error) {
      setExportStatus({ type: 'error', message: 'Failed to copy to clipboard.' });
      setTimeout(() => setExportStatus(null), 3000);
    }
  }, []);

  // Initialize JSON editor
  const openJsonEditor = useCallback(() => {
    setJsonValue(exportProject());
    setShowJsonEditor(true);
  }, [exportProject]);

  // Save JSON changes
  const saveJsonChanges = useCallback(() => {
    try {
      JSON.parse(jsonValue); // Validate
      saveState(); // Save current state
      importProject(jsonValue);
      setShowJsonEditor(false);
      setExportStatus({ type: 'success', message: 'Schema updated successfully!' });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      alert("Invalid JSON format. Please check your syntax.");
    }
  }, [jsonValue, saveState, importProject]);

  // Update node field with history
  const updateNodeField = useCallback((field, value) => {
    if (!selectedNode || !activeFloor) return;
    
    saveState();
    const updates = {};
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updates[parent] = { ...selectedNode[parent], [child]: value };
    } else {
      updates[field] = value;
    }
    
    updateNode(activeFloor.id, selectedNode.id, updates);
    setEditingField(null);
  }, [selectedNode, activeFloor, saveState, updateNode]);

  // Delete selected node with confirmation
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode || !activeFloor) return;
    
    const hasConnections = project?.connections?.some(c => 
      c.from === selectedNode.id || c.to === selectedNode.id
    );
    
    const message = hasConnections 
      ? `Delete node "${selectedNode.name}" and all its connections?`
      : `Delete node "${selectedNode.name}"?`;
      
    if (window.confirm(message)) {
      saveState();
      
      // Remove connections first
      if (hasConnections) {
        project.connections
          .filter(c => c.from === selectedNode.id || c.to === selectedNode.id)
          .forEach(c => removeConnection(c.from, c.to));
      }
      
      removeNode(activeFloor.id, selectedNode.id);
      setSelectedNode(null);
    }
  }, [selectedNode, activeFloor, project?.connections, saveState, removeConnection, removeNode, setSelectedNode]);

 // Get project statistics
 const getProjectStats = useCallback(() => {
   const totalNodes = project?.floors?.reduce((acc, floor) => acc + (floor.nodes?.length || 0), 0) || 0;
   const totalConnections = project?.connections?.length || 0;
   const floorCount = project?.floors?.length || 0;
   
   return { totalNodes, totalConnections, floorCount };
 }, [project]);

 const stats = getProjectStats();

 return (
   <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
     {/* Header with actions */}
     <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
       <div className="flex items-center justify-between mb-3">
         <h2 className="font-bold text-gray-800 text-lg">Inspector</h2>
         <div className="flex gap-1">
           <button
             onClick={openJsonEditor}
             className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
             title="Edit JSON Schema"
           >
             <Code size={16} />
           </button>
           <button
             onClick={handleExport}
             className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
             title="Export Project"
           >
             <Download size={16} />
           </button>
           <label className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer">
             <Upload size={16} />
             <input
               type="file"
               accept=".json"
               onChange={handleImport}
               className="hidden"
               title="Import Project"
             />
           </label>
         </div>
       </div>

       {/* Status indicator */}
       {exportStatus && (
         <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
           exportStatus.type === 'success' 
             ? 'bg-green-100 text-green-800' 
             : 'bg-red-100 text-red-800'
         }`}>
           {exportStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
           {exportStatus.message}
         </div>
       )}

       {/* Quick actions */}
       <div className="flex gap-2 mt-2">
         <button
           onClick={undo}
           disabled={!canUndo()}
           className="flex-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
         >
           ↶ Undo
         </button>
         <button
           onClick={redo}
           disabled={!canRedo()}
           className="flex-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
         >
           ↷ Redo
         </button>
         <button
           onClick={() => copyToClipboard(exportProject())}
           className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
           title="Copy JSON to clipboard"
         >
           <Copy size={12} />
         </button>
       </div>
     </div>

     <div className="flex-1 overflow-y-auto">
       {/* Project Overview */}
       <div className="p-4 border-b border-gray-100">
         <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
           <Info size={16} />
           Project Overview
         </h3>
         <div className="grid grid-cols-2 gap-3 text-sm">
           <div className="bg-blue-50 p-3 rounded-lg">
             <div className="text-2xl font-bold text-blue-600">{stats.floorCount}</div>
             <div className="text-blue-800 text-xs">Floors</div>
           </div>
           <div className="bg-green-50 p-3 rounded-lg">
             <div className="text-2xl font-bold text-green-600">{stats.totalNodes}</div>
             <div className="text-green-800 text-xs">Nodes</div>
           </div>
           <div className="bg-purple-50 p-3 rounded-lg col-span-2">
             <div className="text-2xl font-bold text-purple-600">{stats.totalConnections}</div>
             <div className="text-purple-800 text-xs">Connections</div>
           </div>
         </div>
         
         <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
           <div><strong>Name:</strong> {project?.building?.name || "Untitled Project"}</div>
           <div><strong>Created:</strong> {project?.building?.meta?.createdAt ? new Date(project.building.meta.createdAt).toLocaleDateString() : "Unknown"}</div>
         </div>
       </div>

       {/* Current Floor Info */}
       {activeFloor && (
         <div className="p-4 border-b border-gray-100">
           <h3 className="font-semibold text-gray-700 mb-2">Current Floor</h3>
           <div className="space-y-2 text-sm">
             <div className="flex justify-between">
               <span className="text-gray-500">Name:</span>
               <span className="font-medium">{activeFloor.name}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-500">Level:</span>
               <span className="font-medium">{activeFloor.level}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-500">Nodes:</span>
               <span className="font-medium">{activeFloor.nodes?.length || 0}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-500">Connections:</span>
               <span className="font-medium">
                 {project?.connections?.filter(c => {
                   const fromNode = project.floors.flatMap(f => f.nodes || []).find(n => n.id === c.from);
                   const toNode = project.floors.flatMap(f => f.nodes || []).find(n => n.id === c.to);
                   return fromNode?.coordinates?.floor === activeFloor.id && toNode?.coordinates?.floor === activeFloor.id;
                 }).length || 0}
               </span>
             </div>
           </div>
         </div>
       )}

       {/* Selected Node Details */}
       {selectedNode ? (
         <div className="p-4">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-semibold text-gray-700 flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${
                 selectedNode.type === 'room' ? 'bg-green-500' :
                 selectedNode.type === 'hallway' ? 'bg-gray-500' :
                 selectedNode.type === 'stair' ? 'bg-orange-500' :
                 selectedNode.type === 'elevator' ? 'bg-purple-500' : 'bg-red-500'
               }`} />
               Selected Node
             </h3>
             <button
               onClick={deleteSelectedNode}
               className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
               title="Delete Node"
             >
               <Trash2 size={16} />
             </button>
           </div>

           <div className="space-y-4">
             {/* Node Name */}
             <div>
               <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Name</label>
               {editingField === 'name' ? (
                 <input
                   type="text"
                   value={selectedNode.name}
                   onChange={(e) => updateNodeField('name', e.target.value)}
                   onBlur={() => setEditingField(null)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') setEditingField(null);
                     if (e.key === 'Escape') setEditingField(null);
                   }}
                   className="w-full text-sm border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   autoFocus
                 />
               ) : (
                 <div
                   className="text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between group transition-colors"
                   onClick={() => setEditingField('name')}
                 >
                   <span className="font-medium">{selectedNode.name || "Unnamed"}</span>
                   <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                 </div>
               )}
             </div>

             {/* Node Type */}
             <div>
               <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Type</label>
               {editingField === 'type' ? (
                 <select
                   value={selectedNode.type}
                   onChange={(e) => updateNodeField('type', e.target.value)}
                   onBlur={() => setEditingField(null)}
                   className="w-full text-sm border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   autoFocus
                 >
                   <option value="room">Room</option>
                   <option value="hallway">Hallway</option>
                   <option value="stair">Staircase</option>
                   <option value="elevator">Elevator</option>
                 </select>
               ) : (
                 <div
                   className="text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between group transition-colors"
                   onClick={() => setEditingField('type')}
                 >
                   <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                     selectedNode.type === 'room' ? 'bg-green-100 text-green-800' :
                     selectedNode.type === 'hallway' ? 'bg-gray-100 text-gray-800' :
                     selectedNode.type === 'stair' ? 'bg-orange-100 text-orange-800' :
                     selectedNode.type === 'elevator' ? 'bg-purple-100 text-purple-800' :
                     'bg-red-100 text-red-800'
                   }`}>
                     {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                   </span>
                   <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                 </div>
               )}
             </div>

             {/* Coordinates */}
             <div>
               <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Position</label>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-xs text-gray-400 mb-1 block">X Coordinate</label>
                   {editingField === 'coordinates.x' ? (
                     <input
                       type="number"
                       step="0.01"
                       min="0"
                       max="100"
                       value={selectedNode.coordinates.x}
                       onChange={(e) => updateNodeField('coordinates.x', parseFloat(e.target.value))}
                       onBlur={() => setEditingField(null)}
                       className="w-full text-sm border border-blue-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       autoFocus
                     />
                   ) : (
                     <div
                       className="text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 hover:bg-gray-100 cursor-pointer text-center font-mono transition-colors"
                       onClick={() => setEditingField('coordinates.x')}
                     >
                       {selectedNode.coordinates.x?.toFixed(1)}%
                     </div>
                   )}
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 mb-1 block">Y Coordinate</label>
                   {editingField === 'coordinates.y' ? (
                     <input
                       type="number"
                       step="0.01"
                       min="0"
                       max="100"
                       value={selectedNode.coordinates.y}
                       onChange={(e) => updateNodeField('coordinates.y', parseFloat(e.target.value))}
                       onBlur={() => setEditingField(null)}
                       className="w-full text-sm border border-blue-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       autoFocus
                     />
                   ) : (
                     <div
                       className="text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 hover:bg-gray-100 cursor-pointer text-center font-mono transition-colors"
                       onClick={() => setEditingField('coordinates.y')}
                     >
                       {selectedNode.coordinates.y?.toFixed(1)}%
                     </div>
                   )}
                 </div>
               </div>
             </div>

             {/* Connections */}
             <div>
               <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Connections</label>
               <div className="text-sm text-gray-600 mb-2">
                 {project?.connections?.filter(c => 
                   c.from === selectedNode.id || c.to === selectedNode.id
                 ).length || 0} connection(s)
               </div>
               <div className="space-y-2 max-h-32 overflow-y-auto">
                 {project?.connections
                   ?.filter(c => c.from === selectedNode.id || c.to === selectedNode.id)
                   .map((conn, idx) => {
                     const otherId = conn.from === selectedNode.id ? conn.to : conn.from;
                     const otherNode = project.floors
                       .flatMap(f => f.nodes || [])
                       .find(n => n.id === otherId);
                     
                     return (
                       <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg text-xs">
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${
                             otherNode?.type === 'room' ? 'bg-green-500' :
                             otherNode?.type === 'hallway' ? 'bg-gray-500' :
                             otherNode?.type === 'stair' ? 'bg-orange-500' :
                             otherNode?.type === 'elevator' ? 'bg-purple-500' : 'bg-red-500'
                           }`} />
                           <span className="font-medium">{otherNode?.name || 'Unknown'}</span>
                         </div>
                         <button
                           onClick={() => {
                             saveState();
                             removeConnection(conn.from, conn.to);
                           }}
                           className="p-1 text-red-500 hover:bg-red-100 rounded"
                           title="Remove connection"
                         >
                           <Trash2 size={12} />
                         </button>
                       </div>
                     );
                   })}
               </div>
             </div>

             {/* Metadata */}
             <div>
               <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                 Metadata
                 <span className="text-gray-400 normal-case font-normal ml-1">(JSON)</span>
               </label>
               <textarea
                 value={JSON.stringify(selectedNode.meta || {}, null, 2)}
                 onChange={(e) => {
                   try {
                     const parsed = JSON.parse(e.target.value);
                     updateNodeField('meta', parsed);
                   } catch {
                     // Invalid JSON, don't update
                   }
                 }}
                 className="w-full text-xs font-mono border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 placeholder='{"key": "value"}'
               />
             </div>
           </div>
         </div>
       ) : (
         <div className="p-8 text-center text-gray-500">
           <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
             <Eye size={24} className="text-gray-400" />
           </div>
           <div className="text-sm font-medium mb-1">No node selected</div>
           <div className="text-xs text-gray-400">Click on a node to view and edit its details</div>
         </div>
       )}
     </div>

     {/* JSON Schema Editor Modal */}
     {showJsonEditor && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[85vh] h-full
          flex flex-col">
           <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
             <h3 className="text-lg font-bold text-gray-800">Project Schema Editor</h3>
             <div className="flex gap-2">
               <button
                 onClick={() => copyToClipboard(jsonValue)}
                 className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
               >
                 <Copy size={14} className="inline mr-1" />
                 Copy
               </button>
               <button
                 onClick={() => setShowJsonEditor(false)}
                 className="text-gray-500 hover:text-gray-700 p-1 rounded"
               >
                 ✕
               </button>
             </div>
           </div>
           
           <div className="flex-1   p-4 overflow-hidden">
             <textarea
               value={jsonValue}
               onChange={(e) => setJsonValue(e.target.value)}
               className="w-full h-full font-mono text-sm border border-gray-300 rounded-lg p-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               placeholder="Edit your project JSON schema here..."
               spellCheck={false}
             />
           </div>
           
           <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">
             <div className="text-xs text-gray-500">
               ⚠️ Editing the schema directly can break your project. Make sure to backup first.
             </div>
             <div className="flex gap-2">
               <button
                 onClick={() => setShowJsonEditor(false)}
                 className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={saveJsonChanges}
                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
               >
                 Apply Changes
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default Inspector;