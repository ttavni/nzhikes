export const layerTypes = {
  fill: "['fill-opacity']",
  line: "['line-opacity']",
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
};

export const alignments = {
  left: "lefty",
  center: "centered",
  right: "righty",
};

export const transformRequest = (url) => {
  const hasQuery = url.indexOf("?") !== -1;
  const suffix = hasQuery
    ? "&pluginName=scrollytellingV2"
    : "?pluginName=scrollytellingV2";

  return {
    url: url + suffix,
  };
};
