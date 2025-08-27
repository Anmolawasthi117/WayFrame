// src/components/SchemaEditor.jsx
import { useSchemaStore } from "../store/useSchemaStore";
import { useState } from "react";

export default function SchemaEditor() {
  const schema = useSchemaStore((s) => s.schema);
  const importSchema = useSchemaStore((s) => s.importSchema);
  const exportSchema = useSchemaStore((s) => s.exportSchema);

  const [raw, setRaw] = useState(exportSchema());

  const handleUpdate = () => {
    try {
      const parsed = JSON.parse(raw);
      importSchema(parsed);
    } catch (err) {
      alert("❌ Invalid JSON format");
    }
  };

  return (
    <div className="flex flex-col h-full border-l p-2">
      <h2 className="font-bold mb-2">Raw Schema Editor</h2>
      <textarea
        className="flex-1 border p-2 font-mono text-sm"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <button
        onClick={handleUpdate}
        className="mt-2 p-2 bg-blue-600 text-white rounded"
      >
        Update Schema
      </button>
    </div>
  );
}
