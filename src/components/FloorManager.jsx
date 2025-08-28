import { useRef, useState, useCallback } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useFloorStore } from "../store/useFloorStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { Plus, Check, Pencil, Trash, Upload, Image, Move3D } from "lucide-react";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

const FloorManager = () => {
  const project = useProjectStore((s) => s.project);
  const activeFloorId = useProjectStore((s) => s.activeFloorId);
  const setActiveFloor = useProjectStore((s) => s.setActiveFloor);
  const { addFloor, updateFloor, removeFloor } = useFloorStore();
  const { saveState } = useHistoryStore();

  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [draggedFloor, setDraggedFloor] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    saveState();
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await toBase64(file);
        const name = file.name.replace(/\.[^/.]+$/, "");
        
        await addFloor({
          name,
          level: project.floors.length + i,
          imageUrl: base64,
        });
      }
    } catch (error) {
      console.error("Error uploading floors:", error);
    } finally {
      setIsUploading(false);
    }
  }, [addFloor, project.floors.length, saveState]);

  const handleFileChange = useCallback((e) => {
    handleUpload(Array.from(e.target.files));
    e.target.value = '';
  }, [handleUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const handleFloorDelete = useCallback((floorId, floorName) => {
    const hasNodes = project.floors.find(f => f.id === floorId)?.nodes?.length > 0;
    const message = hasNodes 
      ? `Delete floor "${floorName}" and all its ${hasNodes} nodes?`
      : `Delete floor "${floorName}"?`;
      
    if (window.confirm(message)) {
      saveState();
      removeFloor(floorId);
    }
  }, [project.floors, saveState, removeFloor]);

  const handleFloorEdit = useCallback((floor) => {
    setEditingId(floor.id);
    setEditName(floor.name);
  }, []);

  const handleFloorUpdate = useCallback((floorId, name) => {
    if (name.trim()) {
      saveState();
      updateFloor(floorId, { name: name.trim() });
    }
    setEditingId(null);
  }, [saveState, updateFloor]);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="font-bold text-gray-800 text-lg mb-3">Floor Manager</h2>
        
        {/* Upload area */}
        <div
          className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer bg-white"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-blue-600">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={20} className="text-blue-500" />
              <div className="text-sm text-blue-600 font-medium">
                Upload Floor Images
              </div>
              <div className="text-xs text-gray-500">
                Drag & drop or click to browse
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floors list */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-2">
          {project.floors.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Image size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No floors added yet</p>
              <p className="text-xs mt-1">Upload images to get started</p>
            </div>
          ) : (
            project.floors
              .sort((a, b) => a.level - b.level)
              .map((floor, index) => (
                <div
                  key={floor.id}
                  className={`relative group rounded-lg border transition-all duration-200 ${
                    floor.id === activeFloorId
                      ? "bg-blue-500 text-white border-blue-600 shadow-lg"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {/* Floor item */}
                  <div className="flex items-center p-3">
                    {/* Floor level indicator */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                      floor.id === activeFloorId
                        ? "bg-white text-blue-500"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {floor.level}
                    </div>

                    {/* Floor name */}
                    <div className="flex-1 min-w-0">
                      {editingId === floor.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleFloorUpdate(floor.id, editName)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFloorUpdate(floor.id, editName);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full bg-white text-gray-800 px-2 py-1 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <button
                          className="w-full text-left"
                          onClick={() => setActiveFloor(floor.id)}
                        >
                          <div className="font-medium truncate">{floor.name}</div>
                          <div className={`text-xs truncate ${
                            floor.id === activeFloorId ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {floor.nodes?.length || 0} nodes
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-2">
                      {floor.id === activeFloorId && (
                        <div className={`p-1 rounded ${
                          floor.id === activeFloorId ? "text-white" : "text-gray-400"
                        }`}>
                          <Check size={14} />
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFloorEdit(floor);
                        }}
                        className={`p-1 rounded hover:bg-white/20 ${
                          floor.id === activeFloorId ? "text-white" : "text-gray-400 hover:text-gray-600"
                        }`}
                        title="Rename floor"
                      >
                        <Pencil size={12} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFloorDelete(floor.id, floor.name);
                        }}
                        className="p-1 rounded hover:bg-red-200 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete floor"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Floor preview */}
                  {floor.imageUrl && (
                    <div className="px-3 pb-3">
                      <img
                        src={floor.imageUrl}
                        alt={floor.name}
                        className="w-full h-16 object-cover rounded border-2 border-white/20"

                        // Continue FloorManager component
                       onClick={() => setActiveFloor(floor.id)}
                     />
                   </div>
                 )}

                 {/* Connection indicator for cross-floor connections */}
                 {project.connections?.some(conn => {
                   const fromNode = project.floors.flatMap(f => f.nodes || []).find(n => n.id === conn.from);
                   const toNode = project.floors.flatMap(f => f.nodes || []).find(n => n.id === conn.to);
                   return (fromNode?.coordinates?.floor === floor.id && toNode?.coordinates?.floor !== floor.id) ||
                          (toNode?.coordinates?.floor === floor.id && fromNode?.coordinates?.floor !== floor.id);
                 }) && (
                   <div className="absolute top-2 right-2">
                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Has cross-floor connections" />
                   </div>
                 )}
               </div>
             ))
         )}
       </div>
     </div>

     {/* Footer stats */}
     <div className="p-3 border-t border-gray-200 bg-gray-50">
       <div className="text-xs text-gray-500 space-y-1">
         <div className="flex justify-between">
           <span>Total Floors:</span>
           <span className="font-medium">{project.floors.length}</span>
         </div>
         <div className="flex justify-between">
           <span>Total Nodes:</span>
           <span className="font-medium">
             {project.floors.reduce((acc, floor) => acc + (floor.nodes?.length || 0), 0)}
           </span>
         </div>
         <div className="flex justify-between">
           <span>Connections:</span>
           <span className="font-medium">{project.connections?.length || 0}</span>
         </div>
       </div>
     </div>
   </div>
 );
};

export default FloorManager;