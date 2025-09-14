export const FloorStats = ({ totalFloors, totalNodes, totalConnections }) => (
  <div className="p-3 border-t border-gray-200 bg-gray-50">
    <div className="text-xs text-gray-500 space-y-1">
      <div className="flex justify-between">
        <span>Total Floors:</span>
        <span className="font-medium">{totalFloors}</span>
      </div>
      <div className="flex justify-between">
        <span>Total Nodes:</span>
        <span className="font-medium">{totalNodes}</span>
      </div>
      <div className="flex justify-between">
        <span>Connections:</span>
        <span className="font-medium">{totalConnections}</span>
      </div>
    </div>
  </div>
);
