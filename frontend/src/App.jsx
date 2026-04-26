import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route path="/eligibility" element={<AppShell />} />
      <Route path="/steps" element={<AppShell />} />
      <Route path="/guide" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
