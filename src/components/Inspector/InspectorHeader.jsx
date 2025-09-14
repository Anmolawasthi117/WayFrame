import { Undo2, Redo2, FileDown, FileUp, Code2 } from "lucide-react";

const InspectorHeader = ({
  exportProject,
  importProject,
  undo,
  redo,
  canUndo,
  canRedo,
  openJsonEditor,
}) => {
  const handleExport = () => {
    try {
      const json = exportProject();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "project-schema.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export schema");
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target.result;
        importProject(json);
      } catch (err) {
        alert("Invalid schema file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
      <div className="flex space-x-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleExport}
          className="p-1.5 rounded hover:bg-gray-200"
          title="Export Schema"
        >
          <FileDown size={18} />
        </button>

        <label className="p-1.5 rounded hover:bg-gray-200 cursor-pointer" title="Import Schema">
          <FileUp size={18} />
          <input type="file" accept="application/json" hidden onChange={handleImport} />
        </label>

        <button
          onClick={openJsonEditor}
          className="p-1.5 rounded hover:bg-gray-200"
          title="Edit JSON Schema"
        >
          <Code2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default InspectorHeader;
