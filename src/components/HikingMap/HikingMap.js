import React, { useRef, useEffect } from "react";
import mapboxgl from "!mapbox-gl";
import "./HikingMap.css";
import scrollama from "scrollama";
import { geojsonPoint, createLine, changeCenter } from "../../utils/drive";
import { layerTypes, alignments, transformRequest } from "../../utils/utils";
import { Footer } from "../Footer/Footer";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const HikingMap = ({ routeData, config }) => {
  const mapContainerRef = useRef(null);

  // Initialize map when component mounts
  useEffect(() => {
    function getLayerPaintType(layer) {
      const layerType = map.getLayer(layer).type;
      return layerTypes[layerType];
    }

    function setLayerOpacity(layer) {
      const paintProps = getLayerPaintType(layer.layer);
      paintProps.forEach(function (prop) {
        map.setPaintProperty(layer.layer, prop, layer.opacity);
      });
    }

    const story = document.getElementById("story");
    const features = document.createElement("div");
    features.setAttribute("id", "features");

    const header = document.createElement("div");

    if (config.title) {
      const titleText = document.createElement("h1");
      titleText.innerText = config.title;
      header.appendChild(titleText);
    }

    if (config.subtitle) {
      const subtitleText = document.createElement("h2");
      subtitleText.innerText = config.subtitle;
      header.appendChild(subtitleText);
    }

    if (config.byline) {
      const bylineText = document.createElement("p");
      bylineText.innerText = config.byline;
      header.appendChild(bylineText);
    }

    if (header.innerText.length > 0) {
      header.classList.add(config.theme);
      header.setAttribute("id", "header");
      story.appendChild(header);
    }

    config.chapters.forEach((record, idx) => {
      const container = document.createElement("div");
      const chapter = document.createElement("div");

      if (record.title) {
        const title = document.createElement("h3");
        title.innerText = record.title;
        chapter.appendChild(title);
      }

      if (record.image) {
        const image = new Image();
        image.src = record.image;
        chapter.appendChild(image);
      }

      if (record.description) {
        const story = document.createElement("p");
        story.innerHTML = record.description;
        chapter.appendChild(story);
      }

      container.setAttribute("id", record.id);
      container.classList.add("step");
      container.classList.add(alignments[record.alignment]);
      if (idx === 0) {
        container.classList.add("active");
      }

      chapter.classList.add(config.theme);
      container.appendChild(chapter);
      features.appendChild(container);
    });

    story.appendChild(features);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: config.style,
      center: [167.93032, -44.93195],
      zoom: 12,
      scrollZoom: false,
      transformRequest: transformRequest,
      attributionControl: false,
    });

    map.on("style.load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      // add the DEM source as a terrain layer with exaggerated height
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
    });

    const marker = new mapboxgl.Marker();
    if (config.showMarkers) {
      marker.setLngLat(config.chapters[0].location.center).addTo(map);
    }

    const scroller = scrollama();

    function handleStepProgress(response) {
      let stepProgress;

      if (response.element.id.slice(0, 5) === "drive") {
        const driveSlideNum = parseInt(response.element.id.slice(-1));
        if (driveSlideNum === 0) {
          map.setLayoutProperty("animatedLine", "visibility", "visible");
          stepProgress = Math.round(response.progress * config.driveSmoothness);
        } else {
          stepProgress = Math.round(
            response.progress * config.driveSmoothness +
              config.driveSmoothness * driveSlideNum
          );
        }
        changeCenter(stepProgress, map, config.pivots);
      }
    }

    map.on("load", function () {
      map.setZoom(config.followZoomLevel);
      map.setPitch(config.followPitch);

      const places = {
        type: "FeatureCollection",
        features: routeData.features.slice(1, -1),
      };

      map.addSource("places", {
        type: "geojson",
        data: places,
      });

      map.addLayer({
        id: "circle",
        type: "circle",
        source: "places",
        paint: {
          "circle-color": "#ffffff",
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#888888",
        },
      });

      map.addLayer({
        id: "poi-labels",
        type: "symbol",
        source: "places",
        paint: {
          "text-color": "#ffffff",
        },
        layout: {
          "text-field": ["get", "name"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 0.5,
          "text-justify": "auto",
          "text-size": 12,
        },
      });

      map.addSource("lineSource", {
        type: "geojson",
        data: geojsonPoint,
      });

      map.addSource("pointSource", {
        type: "geojson",
        data: geojsonPoint,
      });

      map.addLayer({
        id: "animatedLine",
        type: "line",
        source: "lineSource",
        paint: {
          "line-opacity": 1,
          "line-color": "#E2439c",
          "line-width": 3.5,
        },
        layout: {
          visibility: "none",
        },
      });

      map.addLayer({
        id: "animatedPoint",
        type: "circle",
        source: "pointSource",
        paint: {
          "circle-radius": 5,
          "circle-opacity": 1,
          "circle-color": "#ffffff",
        },
      });

      // setup the instance, pass callback functions
      scroller
        .setup({
          step: ".step",
          offset: 1,
          progress: true,
        })
        .onStepEnter((response) => {
          const chapter = config.chapters.find(
            (chap) => chap.id === response.element.id
          );
          response.element.classList.add("active");
          map.flyTo(chapter.location);
          if (config.showMarkers) {
            marker.setLngLat(chapter.location.center);
          }
          if (chapter.onChapterEnter.length > 0) {
            chapter.onChapterEnter.forEach(setLayerOpacity);
          }
        })
        .onStepExit((response) => {
          const chapter = config.chapters.find(
            (chap) => chap.id === response.element.id
          );
          response.element.classList.remove("active");
          if (chapter.onChapterExit.length > 0) {
            chapter.onChapterExit.forEach(setLayerOpacity);
          }
        })
        .onStepProgress(handleStepProgress);

      createLine(map, routeData, config);
    });

    // setup resize event
    window.addEventListener("resize", scroller.resize);

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="altitude"></div>
      <div id="map" ref={mapContainerRef}></div>
      <div id="story"></div>
      <Footer className="footer" id="footer" />
    </div>
  );
};

export default HikingMap;
