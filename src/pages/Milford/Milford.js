import React from "react";
import Map from "../../components/HikingMap/HikingMap";
import track from "./data/milford.json";
import { config } from "./config/config";

export default function Milford() {
  return <Map routeData={track} config={config} />;
}
