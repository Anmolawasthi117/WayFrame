import { Routes, Route } from "react-router-dom";

import Editor from "./pages/Editor";
import StoreProvider from "../store/StoreProvider";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Editor />} />
        </Routes>
      </StoreProvider>
    </div>
  );
}

export default App;
