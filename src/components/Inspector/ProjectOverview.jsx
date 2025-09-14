import { Info } from "lucide-react";

const ProjectOverview = ({ project }) => {
  const totalNodes =
    project?.floors?.reduce((sum, f) => sum + (f.nodes?.length || 0), 0) || 0;
  const totalConnections = project?.connections?.length || 0;
  const floorCount = project?.floors?.length || 0;

  return (
    <div className="p-4 border-b border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Info size={16} />
        Project Overview
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-xl font-bold text-blue-600">{floorCount}</div>
          <div>Floors</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-xl font-bold text-green-600">{totalNodes}</div>
          <div>Nodes</div>
        </div>
        <div className="bg-purple-50 p-3 rounded col-span-2">
          <div className="text-xl font-bold text-purple-600">{totalConnections}</div>
          <div>Connections</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
