import { X } from "lucide-react";
import { useEffect, useState } from "react";

const JsonEditorModal = ({ isOpen, onClose, data, onSave }) => {
  const [jsonText, setJsonText] = useState("");

  // sync prop → local state when opening
  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(data, null, 2));
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onSave(parsed);
      onClose();
    } catch (err) {
      alert("Invalid JSON format");
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center bg-black/50">
      <div className="bg-white h-full rounded-lg shadow-lg w-[600px] max-h-[80vh] flex flex-col">
        {/* --- Header --- */}
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-semibold text-gray-800">Edit JSON</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {/* --- Editor --- */}
        <div className="flex-1 p-3 overflow-auto">
          <textarea
            className="w-full h-full border rounded p-2 font-mono text-sm resize-none"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </div>

        {/* --- Footer --- */}
        <div className="flex justify-end gap-2 p-3 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonEditorModal;
