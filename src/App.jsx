import { Routes, Route } from "react-router-dom";

import Editor from "./pages/Editor";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Editor />} />
      </Routes>
    </div>
  );
}

export default App;
