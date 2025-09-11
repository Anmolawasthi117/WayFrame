const Connections = ({ project, activeFloor, allNodes, saveState, removeConnection }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
      {project?.connections
        ?.filter((c) => {
          const fromNode = allNodes.find((n) => n.id === c.from);
          const toNode = allNodes.find((n) => n.id === c.to);
          return fromNode?.coordinates?.floor === activeFloor.id && 
                 toNode?.coordinates?.floor === activeFloor.id;
        })
        .map((c) => {
          const from = allNodes.find((n) => n.id === c.from);
          const to = allNodes.find((n) => n.id === c.to);
          if (!from || !to) return null;

          return (
            <g key={`${c.from}-${c.to}`}>
              <line
                x1={`${from.coordinates.x}%`}
                y1={`${from.coordinates.y}%`}
                x2={`${to.coordinates.x}%`}
                y2={`${to.coordinates.y}%`}
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="5,5"
                opacity="0.7"
                className="animate-pulse"
              />
              <circle
                cx={`${(from.coordinates.x + to.coordinates.x) / 2}%`}
                cy={`${(from.coordinates.y + to.coordinates.y) / 2}%`}
                r="6"
                fill="#ef4444"
                className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  saveState();
                  removeConnection(c.from, c.to);
                }}
              />
            </g>
          );
        })}
    </svg>
  );
};

export default Connections;