const Node = ({ node, mode, selectedNodeId, hoveredNode, project, handleNodeClick, handleMouseDown, setHoveredNode, getNodeStyle }) => {
  return (
    <div
      className={getNodeStyle(node)}
      style={{
        left: `${node.coordinates.x}%`,
        top: `${node.coordinates.y}%`,
        cursor: mode === "move" ? "move" : "pointer",
        width: '1px', // Fixed size for cleaner UI
        height: '20px',
        borderRadius: '50%', // Circular node
      }}
      onClick={(e) => handleNodeClick(node, e)}
      onMouseDown={(e) => handleMouseDown(node, e)}
      onMouseEnter={() => setHoveredNode(node.id)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      {/* Tooltip for node name and type */}
      {hoveredNode === node.id && (
        <div
          className="absolute bg-gray-800 text-white text-xs rounded-lg px-3 py-2 -top-10 left-1/2 transform -translate-x-1/2 z-30 shadow-lg whitespace-nowrap"
        >
          {node.name || 'Unnamed'} ({node.type})
        </div>
      )}
      {/* Connection count indicator */}
      {project?.connections?.filter(c => c.from === node.id || c.to === node.id).length > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {project.connections.filter(c => c.from === node.id || c.to === node.id).length}
        </span>
      )}
    </div>
  );
};

export default Node;