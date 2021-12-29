interface verticesDataFormat {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: { name: string };
  };
  features: Array<{
    type: "Feature";
    properties: {
      id: number;
      name: string | null;
      adjacents: string | null;
    };
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
  }>;
}

interface Vertex {
  id: number;
  name: string | null;
  x: number;
  y: number;
  adjacentVertices: Array<number>;
}

async function main() {
  let map = L.map("map", {
    center: [-15.902524037332192, 35.216960433190678],
    zoom: 17,
  });

  const geojsonData: verticesDataFormat = JSON.parse(
    await fetch("./data/vertices.geojson").then((res) => res.text())
  );

  const popupConfigData = JSON.parse(
    await fetch("./data/popupConfig.json").then((res) => res.text())
  );

  type PopupConfigDataValue = {
    fullName: string;
    image: string;
    description: string;
  };

  let namedLocations = geojsonData.features.filter(
    (val) => val.properties.name !== null
  );

  let importantLocations = namedLocations.map((value) => {
    const { fullName, image, description } = popupConfigData[
      value.properties.name as string
    ] as PopupConfigDataValue;

    return L.marker(
      [value.geometry.coordinates[1], value.geometry.coordinates[0]],
      {
        icon: L.icon({
          iconUrl: "./images/marker-icon.png",
          shadowUrl: "./images/marker-shadow.png",
          iconSize: [25, 41], // size of the icon
          shadowSize: [41, 41], // size of the shadow
          iconAnchor: [13, 41], // point of the icon which will correspond to marker's location
          shadowAnchor: [13, 41], // the same for the shadow
          popupAnchor: [0, -41], // point from which the popup should open relative to the iconAnchor
        }),
      }
    ).bindPopup(
      `<img src="./images/${
        image == "" ? "no picture yet.svg" : image
      }"><h2>${fullName}</h2><p>${description}</p>`
    );
  });

  console.log(importantLocations);

  L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }).addTo(map);

  let layer = new L.LayerGroup(importantLocations).addTo(map);

  let layersControl = L.control
    .layers(undefined, { "MUST Locations": layer })
    .addTo(map);

  console.log(map);
  console.log(layer);

  map.fitBounds(
    L.latLngBounds(
      [-15.906283426682707, 35.212281636767003],
      [-15.900090041104445, 35.218580352705224]
    )
  );

  const allVertices: Array<Vertex> = geojsonData.features.map((feature) => {
    return {
      id: feature.properties.id,
      name: feature.properties.name,
      x: feature.geometry.coordinates[0],
      y: feature.geometry.coordinates[1],
      adjacentVertices: eval(
        "[" + (feature.properties.adjacents || "") + "]"
      ) as Array<number>,
    };
  });

  console.log(allVertices);

  let pathLayerGroup = L.layerGroup().addTo(map);

  let fromSelector = create("select", { name: "from", id: "from" }, [
    create("option", { value: "gps", innerText: "Your current location" }),
    ...namedLocations.map((value) =>
      create("option", {
        innerText: (
          popupConfigData[
            value.properties.name as string
          ] as PopupConfigDataValue
        ).fullName,
        value: value.properties.id,
      })
    ),
  ]) as HTMLSelectElement;

  let toSelector = create(
    "select",
    { name: "to", id: "to" },
    namedLocations.map((value) =>
      create("option", {
        innerText: (
          popupConfigData[
            value.properties.name as string
          ] as PopupConfigDataValue
        ).fullName,
        value: value.properties.id,
      })
    )
  ) as HTMLSelectElement;

  let gpsWatchIds: Array<number> = [];

  let locationSelectorOverlay = create(
    "div",
    {
      className: "my_controls",
      onclick: () => (locationSelectorOverlay.style.display = "none"),
    },
    [
      create(
        "div",
        {
          className: "select_locations",
          onclick: (e: MouseEvent) => e.stopPropagation(),
        },
        [
          create("h2", { innerText: "Get directions" }),
          create("p", null, ["From: ", fromSelector]),
          create("p", null, ["To: ", toSelector]),
          create("p", { className: "buttonContainer" }, [
            create("button", {
              innerText: "Show",
              onclick: () => {
                if (gpsWatchIds.length > 0) {
                  for (let id of gpsWatchIds) {
                    navigator.geolocation.clearWatch(id);
                  }
                  gpsWatchIds = [];
                }

                let watchCallbackCount = 0;

                if (fromSelector.value == "gps") {
                  if (navigator.geolocation) {
                    gpsWatchIds.push(
                      navigator.geolocation.watchPosition(
                        (position) => {
                          if (
                            Number.isNaN(position.coords.latitude) ||
                            Number.isNaN(position.coords.longitude)
                          ) {
                            alert("Failed to get current location");
                            return;
                          }

                          let fromPoint = findNearestPoint(
                            position.coords.latitude,
                            position.coords.longitude
                          );

                          if (
                            fromPoint.distance > 0.0045 &&
                            watchCallbackCount == 0
                          ) {
                            alert(
                              "You're too far away from MUST, so the result may be meaningless"
                            );
                          }

                          console.log(position);
                          console.log(fromPoint);

                          let from = fromPoint.id;
                          let to = Number(toSelector.value);

                          if (!Number.isNaN(from) && !Number.isNaN(to)) {
                            console.log(watchCallbackCount);
                            calculateShortestPath(
                              from,
                              to,
                              watchCallbackCount++ == 0,
                              position.coords
                            );
                            console.log(watchCallbackCount);
                          }
                        },
                        (error) => {
                          alert("Geolocation failed: " + error.message);
                          console.log(error);
                        },
                        {
                          enableHighAccuracy: true,
                          maximumAge: 30000,
                        }
                      )
                    );
                  } else {
                    alert("Geolocation is not supported by this browser.");
                    return;
                  }
                } else {
                  let from = Number(fromSelector.value);

                  let to = Number(toSelector.value);

                  if (!Number.isNaN(from) && !Number.isNaN(to)) {
                    calculateShortestPath(from, to, true);
                  }
                }

                locationSelectorOverlay.style.display = "none";
              },
            }),
          ]),
        ]
      ),
    ]
  );

  document.body.appendChild(locationSelectorOverlay);

  document.body.appendChild(
    create(
      "button",
      {
        className: "directions",
        title: "Get directions",
        onclick: () => {
          locationSelectorOverlay.style.display = "flex";
        },
      },
      [create("img", { src: "./images/directions2.svg" })]
    )
  );

  function calculateShortestPath(
    from: number,
    to: number,
    zoomToLine: boolean,
    userLocation?: GeolocationCoordinates
  ) {
    pathLayerGroup.clearLayers();

    let shortestPath = dijkstra(allVertices, from, to).map((value) => [
      value.y,
      value.x,
    ]);

    let polyline = L.polyline(shortestPath as L.LatLngExpression[], {
      color: "red",
      weight: 4,
      opacity: 0.8,
    });

    let destination = allVertices.find((v) => v.id == to) as Vertex;

    let destinationCircle1 = L.circle([destination.y, destination.x], {
      color: "transparent",
      fillColor: "red",
      fillOpacity: 0.6,
      radius: 4,
    });

    let destinationCircle2 = L.circle([destination.y, destination.x], {
      color: "transparent",
      fillColor: "red",
      fillOpacity: 0.5,
      radius: 6,
    });

    if (userLocation) {
      let userCircle1 = L.circle(
        [userLocation.latitude, userLocation.longitude],
        {
          color: "transparent",
          fillColor: "#15f",
          fillOpacity: 0.3,
          radius: userLocation.accuracy,
        }
      );

      let userCircle2 = L.circle(
        [userLocation.latitude, userLocation.longitude],
        {
          color: "white",
          radius: 0,
          stroke: true,
          weight: 13,
        }
      );

      let userCircle3 = L.circle(
        [userLocation.latitude, userLocation.longitude],
        {
          color: "#15f",
          radius: 0,
          stroke: true,
          weight: 10,
        }
      );

      pathLayerGroup.addLayer(userCircle1);
      pathLayerGroup.addLayer(userCircle2);
      pathLayerGroup.addLayer(userCircle3);
    }

    layersControl.removeLayer(pathLayerGroup);

    pathLayerGroup.addLayer(polyline);
    pathLayerGroup.addLayer(destinationCircle1);
    pathLayerGroup.addLayer(destinationCircle2);
    layersControl.addOverlay(pathLayerGroup, "Suggested Path");

    if (zoomToLine) {
      map.fitBounds(polyline.getBounds());
    }
  }

  function findNearestPoint(lat: number, long: number) {
    let min = {
      id: 0,
      distance: Infinity,
    };

    for (let v of allVertices) {
      let distance = Math.sqrt(
        Math.pow(long - v.x, 2) + Math.pow(lat - v.y, 2)
      );

      if (distance < min.distance) {
        min = {
          id: v.id,
          distance,
        };
      }
    }

    return min;
  }
}

main();

function dijkstra(vertices: Array<Vertex>, from: number, to: number) {
  interface DijkstraNode extends Vertex {
    distance: number;
    previous: number | undefined;
  }

  let graphNodes = new Map<number, DijkstraNode>();
  let results = new Map<number, DijkstraNode>();

  for (let v of vertices) {
    graphNodes.set(v.id, {
      distance: Infinity,
      previous: undefined,
      ...v,
    });
  }

  (graphNodes.get(from) as DijkstraNode).distance = 0;

  while (graphNodes.size > 0) {
    let u = minimumDistanceNode(graphNodes);

    results.set(u.id, u);
    graphNodes.delete(u.id);

    for (let adjNodeId of u.adjacentVertices) {
      if (graphNodes.has(adjNodeId)) {
        let v = graphNodes.get(adjNodeId) as DijkstraNode;

        let alt = u.distance + distanceBetween(u, v);

        if (alt < v.distance) {
          v.distance = alt;
          v.previous = u.id;
        }
      }
    }
  }

  let destination = results.get(to) as DijkstraNode;

  let stack: Array<{ x: number; y: number }> = [
    {
      x: destination.x,
      y: destination.y,
    },
  ];

  for (
    let curr = destination, next: DijkstraNode;
    curr.previous !== undefined;
    curr = next
  ) {
    next = results.get(curr.previous) as DijkstraNode;
    stack.push({
      x: next.x,
      y: next.y,
    });
  }

  return stack;

  function distanceBetween(u: DijkstraNode, v: DijkstraNode) {
    return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
  }

  function minimumDistanceNode(map: Map<number, DijkstraNode>) {
    return Array.from(map.values()).reduce((prev, curr) =>
      prev.distance < curr.distance ? prev : curr
    );
  }
}

/**
 * A helper function that creates and returns an HTML Element of the type `type`
 *
 * ---
 * @param type Type of `HTMLElement` to be created
 * @param props Optional properties of the `HTMLElement` to be created
 * @param children Optional HTML Elements to be assigned as children of this element
 *
 * ---
 * @returns {HTMLElement} An `HTMLElement` object
 */
function create(
  type: string,
  props?: any,
  children?: Array<HTMLElement | string>
) {
  if (!type) throw new TypeError("Empty HTMLElement type: " + type);
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  if (children) {
    for (let child of children) {
      if (typeof child != "string") dom.appendChild(child);
      else dom.appendChild(document.createTextNode(child));
    }
  }
  return dom;
}
