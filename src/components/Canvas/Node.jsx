const Node = ({
  node,
  mode,
  selectedNodeId,
  hoveredNode,
  project,
  handleNodeClick,
  handleMouseDown,
  setHoveredNode,
  getNodeStyle,
  zoom, // pass zoom from FloorCanvas
}) => {
  const localConnectionCount = node.connections?.length || 0;
  const globalConnectionCount =
    project?.connections?.filter(
      (c) => c.from === node.nodeId || c.to === node.nodeId
    ).length || 0;

  const nodeSize = 24; // base size in px

  return (
    <div
      className={`${getNodeStyle(node)} flex items-center justify-center`}
      style={{
        left: `${node.coordinates.x}%`,
        top: `${node.coordinates.y}%`,
        cursor: mode === "move" ? "move" : "pointer",
        width: `${nodeSize / zoom}px`,
        height: `${nodeSize / zoom}px`,
        borderRadius: "50%",
        // boxShadow: "0 0 4px rgba(0,0,0,0.3)",
        position: "absolute",
      }}
      onClick={(e) => handleNodeClick(node, e)}
      onMouseDown={(e) => handleMouseDown(node, e)}
      onMouseEnter={() => setHoveredNode(node.nodeId)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      {/* Tooltip */}
      {hoveredNode === node.nodeId && (
        <div className="absolute bg-gray-800 text-white text-xs rounded-lg px-2 py-1 -top-6 left-1/2 transform -translate-x-1/2 z-30 shadow-lg whitespace-nowrap">
          {node.name || "Unnamed"} ({node.type})
        </div>
      )}

      {/* Local connection badge */}
      {localConnectionCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow">
          {localConnectionCount}
        </span>
      )}

      {/* Global connection badge */}
      {globalConnectionCount > 0 && (
        <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow">
          {globalConnectionCount}
        </span>
      )}
    </div>
  );
};

export default Node;
