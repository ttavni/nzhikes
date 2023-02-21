import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Milford from "./pages/Milford/Milford";
import SearchMap from "./components/SearchMap/SearchMap";

function App() {
  const { pathname } = useLocation();

  return (
    <>
      {pathname === "/" ? <SearchMap /> : <></>}
      <Routes>
        <Route path="/milford" element={<Milford />} />
      </Routes>
    </>
  );
}

export default App;
