import * as turf from "@turf/turf";

export const geojsonPoint = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    },
  ],
};

function bearingBetween(coordinate1, coordinate2) {
  const point1 = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coordinate1[0], coordinate1[1]],
    },
  };
  const point2 = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coordinate2[0], coordinate2[1]],
    },
  };
  return turf.bearing(point1, point2);
}

export function createLine(map, routeData, config) {
  // get the coordinates of the line you want to highlight
  const extentArray = routeData.features[0].geometry.coordinates;

  // create a turf linestring based on the line coordinates
  const line = turf.lineString(extentArray);

  // calculate the total length of the line
  const lineDistance = turf.lineDistance(line);

  // how many points you want along the path (more = smoother animation)
  const rects = config.driveTime;

  // calculate the distance between each point on the path
  const segments = lineDistance / rects;

  // based on the number of points...
  for (let i = 0; i <= rects; i++) {
    // calculate point location for each segment
    const pointonline = turf.along(line, segments * i);

    // push new x,y
    const newX = pointonline.geometry.coordinates[0];
    const newY = pointonline.geometry.coordinates[1];

    geojsonPoint.features[0].geometry.coordinates.push([newX, newY]);
    // once 'i' equals the number of points then we're done building our line
    if (i === rects) {
      map.getSource("lineSource").setData(geojsonPoint);
    }
  }
}

function createMovingLine(currentJson) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: currentJson,
        },
      },
    ],
  };
}
export function changeCenter(index, map, pivots) {
  const currentJson = geojsonPoint.features[0].geometry.coordinates.slice(
    0,
    index
  );
  const center = geojsonPoint.features[0].geometry.coordinates[index];
  console.log(index);
  const [centerX, centerY] = [center[0], center[1]];
  const movingLine = createMovingLine(currentJson);

  const elevation = Math.floor(
    map.queryTerrainElevation(center, { exaggerated: false })
  );
  document.getElementsByClassName("altitude")[0].innerText = `${elevation}m`; //@backlog - add altitude to config

  const breakPoints = Object.keys(pivots);
  if (index !== 0) {
    const closest = parseInt(
      breakPoints
        .filter((n) => n < index)
        .reduce((a, b) => {
          return Math.max(a, b);
        })
    );
    const oldCenter =
      geojsonPoint.features[0].geometry.coordinates[closest + 10];
    const newCenter = geojsonPoint.features[0].geometry.coordinates[closest];
    const bearing = bearingBetween(newCenter, oldCenter);

    map.setBearing(bearing);
    map.setZoom(pivots[closest].zoom);

    if (pivots[closest].pitch) {
      map.setPitch(pivots[closest].pitch);
    }
  } else {
    map.setBearing(0);
    map.setZoom(12);
    map.setPitch(0);
  }

  map.setCenter(center);
  const movingPoint = turf.point([centerX, centerY]);
  map.getSource("lineSource").setData(movingLine);
  map.getSource("pointSource").setData(movingPoint);
}
