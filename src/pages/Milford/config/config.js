import chapters from "./chapters";
import pivots from "./pivots";

export const config = {
  style: "mapbox://styles/ttavni/cle7mpkip000301o4eu4u0jom/draft",
  accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
  showMarkers: false,
  driveSlides: 8,
  driveSmoothness: 200,
  driveTime: 200 * 8,
  followZoomLevel: 13,
  followBearing: 100,
  followPitch: 50,
  theme: "light",
  alignment: "left",
  title: "Milford Track",
  subtitle: "A descriptive and interesting subtitle to draw in the reader",
  byline: "By Tim Avni",
  chapters: chapters,
  pivots: pivots,
};
