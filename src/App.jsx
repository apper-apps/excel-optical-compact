import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Settings from "@/components/pages/Settings";
import YourAI from "@/components/pages/YourAI";
import Admin from "@/components/pages/Admin";
import Dashboard from "@/components/pages/Dashboard";
import Tools from "@/components/pages/Tools";
import Wins from "@/components/pages/Wins";
import Learning from "@/components/pages/Learning";
import Recommendations from "@/components/pages/Recommendations";
import Calendar from "@/components/pages/Calendar";
import Community from "@/components/pages/Community";
import Scripts from "@/components/pages/Scripts";
import Layout from "@/components/organisms/Layout";
function App() {
  return (
<BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/community" element={<Community />} />
          <Route path="/calendar" element={<Calendar />} />
<Route path="/wins" element={<Wins />} />
<Route path="/recommendations" element={<Recommendations />} />
<Route path="/admin" element={<Admin />} />
<Route path="/settings" element={<Settings />} />
<Route path="/your-ai" element={<YourAI />} />
</Route>
      </Routes>
</BrowserRouter>
  );
}

export default App;