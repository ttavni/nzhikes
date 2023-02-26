import React from "react";
import Map from "../../components/HikingMap/HikingMap";
import { coordinates } from "./data/coordinates";
import { pointsOfInterest } from "./data/points";
import { config } from "./config/config";
import { trackCreator } from "../../utils/trackCreator";

export default function Milford() {
  const track = trackCreator("Milford Track", coordinates, pointsOfInterest);
  console.log(track);
  return <Map routeData={track} config={config} />;
}
