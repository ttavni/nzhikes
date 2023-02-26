const pointCreator = (places) => {
  const points = Object.keys(places).map((name) => ({
    type: "Feature",
    properties: {
      name: name,
    },
    geometry: {
      type: "Point",
      coordinates: places[name],
    },
  }));

  return points;
};

const routeCreator = (title, coordinates) => {
  return {
    type: "Feature",
    properties: {
      name: title,
    },
    geometry: {
      type: "LineString",
      coordinates: coordinates,
    },
  };
};

export const trackCreator = (title, coordinates, places) => {
  return {
    type: "FeatureCollection",
    features: [routeCreator(title, coordinates), ...pointCreator(places)],
  };
};
