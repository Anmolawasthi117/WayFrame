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
}) => {
  // 🟢 Local connections = from node.connections array
  const localConnectionCount = node.connections?.length || 0;

  // 🔵 Global connections = from project.connections
  const globalConnectionCount =
    project?.connections?.filter(
      (c) => c.from === node.nodeId || c.to === node.nodeId
    ).length || 0;

  return (
    <div
      className={getNodeStyle(node)}
      style={{
        left: `${node.coordinates.x}%`,
        top: `${node.coordinates.y}%`,
        cursor: mode === "move" ? "move" : "pointer",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
      }}
      onClick={(e) => handleNodeClick(node, e)}
      onMouseDown={(e) => handleMouseDown(node, e)}
      onMouseEnter={() => setHoveredNode(node.nodeId)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      {/* Tooltip */}
      {hoveredNode === node.nodeId && (
        <div className="absolute bg-gray-800 text-white text-xs rounded-lg px-3 py-2 -top-10 left-1/2 transform -translate-x-1/2 z-30 shadow-lg whitespace-nowrap">
          {node.name || "Unnamed"} ({node.type})
        </div>
      )}

      {/* Local connection badge */}
      {localConnectionCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
          {localConnectionCount}
        </span>
      )}

      {/* Global connection badge */}
      {globalConnectionCount > 0 && (
        <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
          {globalConnectionCount}
        </span>
      )}
    </div>
  );
};

export default Node;
