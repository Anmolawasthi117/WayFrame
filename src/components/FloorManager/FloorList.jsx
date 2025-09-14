import { Check, Pencil, Trash, Image } from "lucide-react";

export const FloorList = ({
  floors,
  activeFloorId,
  editingId,
  editName,
  onEditNameChange,
  onFloorClick,
  onEdit,
  onUpdate,
  onDelete,
  setEditingId,
  project,
}) => {
  if (floors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Image size={32} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No floors added yet</p>
        <p className="text-xs mt-1">Upload images to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {floors
        .sort((a, b) => a.level - b.level)
        .map((floor) => {
          const hasCrossConnections = project.connections?.some((conn) => {
            const fromNode = project.floors.flatMap((f) => f.nodes || []).find((n) => n.id === conn.from);
            const toNode = project.floors.flatMap((f) => f.nodes || []).find((n) => n.id === conn.to);
            return (
              (fromNode?.coordinates?.floor === floor.id && toNode?.coordinates?.floor !== floor.id) ||
              (toNode?.coordinates?.floor === floor.id && fromNode?.coordinates?.floor !== floor.id)
            );
          });

          return (
            <div
              key={floor.id}
              className={`relative group rounded-lg border transition-all duration-200 ${
                floor.id === activeFloorId
                  ? "bg-blue-500 text-white border-blue-600 shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              <div className="flex items-center p-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                    floor.id === activeFloorId ? "bg-white text-blue-500" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {floor.level}
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === floor.id ? (
                    <input
                      value={editName}
                      onChange={(e) => onEditNameChange(e.target.value)}
                      onBlur={() => onUpdate(floor.id, editName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onUpdate(floor.id, editName);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full bg-white text-gray-800 px-2 py-1 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <button className="w-full text-left" onClick={() => onFloorClick(floor.id)}>
                      <div className="font-medium truncate">{floor.name}</div>
                      <div
                        className={`text-xs truncate ${
                          floor.id === activeFloorId ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {floor.nodes?.length || 0} nodes
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {floor.id === activeFloorId && (
                    <div className="p-1 rounded text-white">
                      <Check size={14} />
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(floor);
                    }}
                    className={`p-1 rounded hover:bg-white/20 ${
                      floor.id === activeFloorId
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="Rename floor"
                  >
                    <Pencil size={12} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(floor.id, floor.name);
                    }}
                    className="p-1 rounded hover:bg-red-200 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete floor"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              </div>

              {floor.imageUrl && (
                <div className="px-3 pb-3">
                  <img
                    src={floor.imageUrl}
                    alt={floor.name}
                    className="w-full h-16 object-cover rounded border-2 border-white/20"
                    onClick={() => onFloorClick(floor.id)}
                  />
                </div>
              )}

              {hasCrossConnections && (
                <div className="absolute top-2 right-2">
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    title="Has cross-floor connections"
                  />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
