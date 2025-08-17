import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Learning from "@/components/pages/Learning";
import Tools from "@/components/pages/Tools";
import Scripts from "@/components/pages/Scripts";
import Community from "@/components/pages/Community";
import Calendar from "@/components/pages/Calendar";
import Wins from "@/components/pages/Wins";
import Recommendations from "@/components/pages/Recommendations";
import Admin from "@/components/pages/Admin";

function App() {
  return (
    <Router>
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;