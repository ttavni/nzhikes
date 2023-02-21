import React, { useRef, useEffect } from "react";
import mapboxgl from "!mapbox-gl";
import { places } from "./places";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapContainer = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  color: white;
  font-size: 2.5vh;
`;

const StyledInput = styled.input`
  ::placeholder {
    font-family: "Verdana", Arial, Helvetica, sans-serif;
    opacity: 1; /* Firefox */
  }
`;

const MapOverlay = styled.div`
  position: absolute;
  width: 25%;
  top: 0;
  bottom: 0;
  left: 0;
  font: 12px/20px;
  max-height: 100%;
  overflow: hidden;

  fieldset {
    display: none;
    background: #ddd;
    border: none;
    padding: 10px;
    margin: 0;
  }

  input {
    display: block;
    border: none;
    width: 100%;
    border-radius: 3px;
    padding: 10px;
    margin: 0;
    box-sizing: border-box;
  }

  .listing {
    overflow: auto;
    max-height: 100%;
  }

  .listing > * {
    display: block;
    padding: 5px 10px;
    margin: 0;
  }

  .listing a {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    color: #404;
    text-decoration: none;
    font-size: small;
  }

  .listing a:last-child {
    border: none;
  }

  .listing a:hover {
    background: #f0f0f0;
  }
`;

const SearchMap = () => {
  const mapContainerRef = useRef(null);
  const navigate = useNavigate();

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [171.8634076117346, -41.10291949113152],
      maxZoom: 12,
      minZoom: 2,
      zoom: 2,
      maxBounds: [
        [154.87, -47.93],
        [191.25, -32.26],
      ],
      attributionControl: false,
    });

    let walks = [];

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
      closeButton: false,
    });

    const filterEl = document.getElementById("feature-filter");
    const listingEl = document.getElementById("feature-listing");

    function renderListings(features) {
      const empty = document.createElement("p");
      listingEl.innerHTML = "";
      if (features.length) {
        for (const feature of features) {
          const itemLink = document.createElement("a");
          const label = `${feature.properties.name}`;
          itemLink.href = feature.properties.href;
          itemLink.target = "_blank";
          itemLink.textContent = label;
          itemLink.addEventListener("mouseover", () => {
            // Highlight corresponding feature on the map
            popup
              .setLngLat(feature.geometry.coordinates)
              .setText(label)
              .addTo(map);
          });
          listingEl.appendChild(itemLink);
        }

        // Show the filter input
        filterEl.parentNode.style.display = "block";
      } else if (features.length === 0 && filterEl.value !== "") {
        empty.textContent = "No results found";
        listingEl.appendChild(empty);
      } else {
        empty.textContent = "Drag the map to populate results";
        listingEl.appendChild(empty);

        // Hide the filter input
        filterEl.parentNode.style.display = "none";

        // remove features filter
        map.setFilter("walk", ["has", "name"]);
      }
    }

    function normalize(string) {
      return string.trim().toLowerCase();
    }

    // Because features come from tiled vector data,
    // feature geometries may be split
    // or duplicated across tile boundaries.
    // As a result, features may appear
    // multiple times in query results.
    function getUniqueFeatures(features, comparatorProperty) {
      const uniqueIds = new Set();
      const uniqueFeatures = [];
      for (const feature of features) {
        const id = feature.properties[comparatorProperty];
        if (!uniqueIds.has(id)) {
          uniqueIds.add(id);
          uniqueFeatures.push(feature);
        }
      }
      return uniqueFeatures;
    }

    map.on("load", () => {
      map.addSource("walks", {
        type: "geojson",
        data: places,
      });
      map.addLayer({
        id: "walk",
        source: "walks",
        type: "circle",
        paint: {
          "circle-color": "#4264fb",
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("movestart", () => {
        map.setFilter("walk", ["has", "name"]);
      });

      map.on("moveend", () => {
        const features = map.queryRenderedFeatures({ layers: ["walk"] });

        if (features) {
          const uniqueFeatures = getUniqueFeatures(features, "name");
          // Populate features for the listing overlay.
          renderListings(uniqueFeatures);

          // Clear the input container
          filterEl.value = "";
          walks = uniqueFeatures;
        }
      });

      map.on("mousemove", "walk", (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = "pointer";

        // Populate the popup and set its coordinates based on the feature.
        const feature = e.features[0];
        popup
          .setLngLat(feature.geometry.coordinates)
          .setText(`${feature.properties.name}`)
          .addTo(map);
      });

      map.on("click", "walk", (e) => {
        navigate(e.features[0].properties.href);
      });

      map.on("mouseleave", "walk", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      filterEl.addEventListener("keyup", (e) => {
        const value = normalize(e.target.value);

        // Filter visible features that match the input value.
        const filtered = [];
        for (const feature of walks) {
          const name = normalize(feature.properties.name);
          if (name.includes(value)) {
            filtered.push(feature);
          }
        }

        // Populate the sidebar with filtered results
        renderListings(filtered);

        // Set the filter to populate features into the layer.
        if (filtered.length) {
          map.setFilter("walk", [
            "match",
            ["get", "name"],
            filtered.map((feature) => {
              return feature.properties.name;
            }),
            true,
            false,
          ]);
        }
      });

      renderListings([]);
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <MapContainer id="map" ref={mapContainerRef}></MapContainer>
      <MapOverlay>
        <fieldset>
          <StyledInput
            id="feature-filter"
            type="text"
            placeholder="Filter walks by name"
          />
          <div id="feature-listing" className="listing"></div>
        </fieldset>
      </MapOverlay>
    </>
  );
};

export default SearchMap;
