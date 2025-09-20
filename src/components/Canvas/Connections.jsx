const Connections = ({ project, activeFloor, allNodes }) => {
  if (!project || !activeFloor) return null;

  const floorNodes = activeFloor.nodes || [];

  // 🟢 Local connections (within this floor)
  const localConnections = [];
  floorNodes.forEach((node) => {
    node.connections?.forEach((conn) => {
      const target = floorNodes.find((n) => n.nodeId === conn.nodeId);
      if (target) {
        localConnections.push({
          from: node,
          to: target,
          distance: conn.distance,
        });
      }
    });
  });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      {localConnections.map((c, idx) => {
        if (
          !c.from?.coordinates ||
          !c.to?.coordinates ||
          c.from.coordinates.x == null ||
          c.from.coordinates.y == null ||
          c.to.coordinates.x == null ||
          c.to.coordinates.y == null
        ) {
          return null;
        }

        return (
          <line
            key={`local-${idx}`}
            x1={`${c.from.coordinates.x}%`}
            y1={`${c.from.coordinates.y}%`}
            x2={`${c.to.coordinates.x}%`}
            y2={`${c.to.coordinates.y}%`}
            stroke="blue"
            strokeWidth="2"
            opacity="0.4"
          />
        );
      })}
    </svg>
  );
};

export default Connections;
