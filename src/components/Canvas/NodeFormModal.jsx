import { useState } from "react";
import { createPortal } from "react-dom";

const NodeFormModal = ({ nodeData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(nodeData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a node name");
      return;
    }
    onSave(formData);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Create New Node</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a descriptive name"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="room">Room</option>
              <option value="hallway">Hallway</option>
              <option value="stair">Staircase</option>
              <option value="elevator">Elevator</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X Position (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.coordinates.x}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coordinates: {
                      ...prev.coordinates,
                      x: parseFloat(e.target.value),
                    },
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y Position (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.coordinates.y}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coordinates: {
                      ...prev.coordinates,
                      y: parseFloat(e.target.value),
                    },
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              Create Node
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default NodeFormModal;
