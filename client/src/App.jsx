import { useState } from "react";
import { Route, Routes } from "react-router-dom";

// import "./App.css";

import MainLayout from "./layouts/MainLayout";
import Home from "./Pages/Home/Home";
import Features from "./Pages/Features/Features";
import Login from "./Pages/Login/Login";
import NotFound from "./Pages/NotFound/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
