import { useRef } from "react";
import { Upload } from "lucide-react";

export const FloorUpload = ({ isUploading, onFileChange, onDragOver, onDrop }) => {
  const fileInputRef = useRef(null);

  return (
    <div
      className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer bg-white"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={onFileChange}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-blue-600">Uploading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload size={20} className="text-blue-500" />
          <div className="text-sm text-blue-600 font-medium">Upload Floor Images</div>
          <div className="text-xs text-gray-500">Drag & drop or click to browse</div>
        </div>
      )}
    </div>
  );
};
