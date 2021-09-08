"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function calculateShortestPath(from, to) {
            var shortestPath = dijkstra(allVertices, from, to).map(function (value) { return [
                value.y,
                value.x,
            ]; });
            var polyline = L.polyline(shortestPath, {
                color: "red",
                weight: 4,
            });
            layersControl.removeLayer(pathLayerGroup);
            pathLayerGroup.addLayer(polyline);
            layersControl.addOverlay(pathLayerGroup, "Suggested Path");
            map.fitBounds(polyline.getBounds());
            locationSelectorOverlay.style.display = "none";
        }
        function findNearestPoint(lat, long) {
            var min = {
                id: 0,
                distance: Infinity,
            };
            for (var _i = 0, allVertices_1 = allVertices; _i < allVertices_1.length; _i++) {
                var v = allVertices_1[_i];
                var distance = Math.sqrt(Math.pow(long - v.x, 2) + Math.pow(lat - v.y, 2));
                if (distance < min.distance) {
                    min = {
                        id: v.id,
                        distance: distance,
                    };
                }
            }
            return min;
        }
        var map, geojsonData, _a, _b, popupConfigData, _c, _d, namedLocations, importantLocations, layer, layersControl, allVertices, pathLayerGroup, fromSelector, toSelector, locationSelectorOverlay;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    map = L.map("map", {
                        center: [-15.902524037332192, 35.216960433190678],
                        zoom: 17,
                    });
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fetch("../data/vertices.geojson").then(function (res) { return res.text(); })];
                case 1:
                    geojsonData = _b.apply(_a, [_e.sent()]);
                    _d = (_c = JSON).parse;
                    return [4 /*yield*/, fetch("../data/popupConfig.json").then(function (res) { return res.text(); })];
                case 2:
                    popupConfigData = _d.apply(_c, [_e.sent()]);
                    namedLocations = geojsonData.features.filter(function (val) { return val.properties.name !== null; });
                    importantLocations = namedLocations.map(function (value) {
                        var _a = popupConfigData[value.properties.name], fullName = _a.fullName, image = _a.image, description = _a.description;
                        return L.marker([
                            value.geometry.coordinates[1],
                            value.geometry.coordinates[0],
                        ]).bindPopup("<img src=\"./images/" + (image == "" ? "no picture yet.svg" : image) + "\"><h2>" + fullName + "</h2><p>" + description + "</p>");
                    });
                    console.log(importantLocations);
                    L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
                        maxZoom: 20,
                        subdomains: ["mt0", "mt1", "mt2", "mt3"],
                    }).addTo(map);
                    layer = new L.LayerGroup(importantLocations).addTo(map);
                    layersControl = L.control
                        .layers(undefined, { "MUST Locations": layer })
                        .addTo(map);
                    console.log(map);
                    console.log(layer);
                    map.fitBounds(L.latLngBounds([-15.906283426682707, 35.212281636767003], [-15.900090041104445, 35.218580352705224]));
                    allVertices = geojsonData.features.map(function (feature) {
                        return {
                            id: feature.properties.id,
                            name: feature.properties.name,
                            x: feature.geometry.coordinates[0],
                            y: feature.geometry.coordinates[1],
                            adjacentVertices: eval("[" + (feature.properties.adjacents || "") + "]"),
                        };
                    });
                    console.log(allVertices);
                    pathLayerGroup = L.layerGroup().addTo(map);
                    fromSelector = create("select", { name: "from", id: "from" }, __spreadArray([
                        create("option", { value: "gps", innerText: "Your current location" })
                    ], namedLocations.map(function (value) {
                        return create("option", {
                            innerText: popupConfigData[value.properties.name].fullName,
                            value: value.properties.id,
                        });
                    })));
                    toSelector = create("select", { name: "to", id: "to" }, namedLocations.map(function (value) {
                        return create("option", {
                            innerText: popupConfigData[value.properties.name].fullName,
                            value: value.properties.id,
                        });
                    }));
                    locationSelectorOverlay = create("div", {
                        className: "my_controls",
                        onclick: function () { return (locationSelectorOverlay.style.display = "none"); },
                    }, [
                        create("div", {
                            className: "select_locations",
                            onclick: function (e) { return e.stopPropagation(); },
                        }, [
                            create("h2", { innerText: "Get directions" }),
                            create("p", null, ["From: ", fromSelector]),
                            create("p", null, ["To: ", toSelector]),
                            create("p", { className: "buttonContainer" }, [
                                create("button", {
                                    innerText: "Show",
                                    onclick: function () {
                                        pathLayerGroup.clearLayers();
                                        if (fromSelector.value == "gps") {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(function (position) {
                                                    if (Number.isNaN(position.coords.latitude) ||
                                                        Number.isNaN(position.coords.longitude)) {
                                                        alert("Failed to get current location");
                                                        return;
                                                    }
                                                    var fromPoint = findNearestPoint(position.coords.latitude, position.coords.longitude);
                                                    if (fromPoint.distance > 0.0045) {
                                                        alert("You're too far away from MUST, so the result may be meaningless");
                                                    }
                                                    console.log(position);
                                                    console.log(fromPoint);
                                                    var from = fromPoint.id;
                                                    var to = Number(toSelector.value);
                                                    if (!Number.isNaN(from) && !Number.isNaN(to)) {
                                                        calculateShortestPath(from, to);
                                                    }
                                                }, function (error) {
                                                    alert("Geolocation failed: " + error.message);
                                                    console.log(error);
                                                });
                                            }
                                            else {
                                                alert("Geolocation is not supported by this browser.");
                                                return;
                                            }
                                        }
                                        else {
                                            var from = Number(fromSelector.value);
                                            var to = Number(toSelector.value);
                                            if (!Number.isNaN(from) && !Number.isNaN(to)) {
                                                calculateShortestPath(from, to);
                                            }
                                        }
                                    },
                                }),
                            ]),
                        ]),
                    ]);
                    document.body.appendChild(locationSelectorOverlay);
                    document.body.appendChild(create("button", {
                        className: "directions",
                        title: "Get directions",
                        onclick: function () {
                            locationSelectorOverlay.style.display = "flex";
                        },
                    }, [create("img", { src: "./images/directions2.svg" })]));
                    return [2 /*return*/];
            }
        });
    });
}
main();
function dijkstra(vertices, from, to) {
    var graphNodes = new Map();
    var results = new Map();
    for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
        var v = vertices_1[_i];
        graphNodes.set(v.id, __assign({ distance: Infinity, previous: undefined }, v));
    }
    graphNodes.get(from).distance = 0;
    while (graphNodes.size > 0) {
        var u = minimumDistanceNode(graphNodes);
        results.set(u.id, u);
        graphNodes.delete(u.id);
        for (var _a = 0, _b = u.adjacentVertices; _a < _b.length; _a++) {
            var adjNodeId = _b[_a];
            if (graphNodes.has(adjNodeId)) {
                var v = graphNodes.get(adjNodeId);
                var alt = u.distance + distanceBetween(u, v);
                if (alt < v.distance) {
                    v.distance = alt;
                    v.previous = u.id;
                }
            }
        }
    }
    var destination = results.get(to);
    var stack = [
        {
            x: destination.x,
            y: destination.y,
        },
    ];
    for (var curr = destination, next = void 0; curr.previous !== undefined; curr = next) {
        next = results.get(curr.previous);
        stack.push({
            x: next.x,
            y: next.y,
        });
    }
    return stack;
    function distanceBetween(u, v) {
        return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
    }
    function minimumDistanceNode(map) {
        return Array.from(map.values()).reduce(function (prev, curr) {
            return prev.distance < curr.distance ? prev : curr;
        });
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
function create(type, props, children) {
    if (!type)
        throw new TypeError("Empty HTMLElement type: " + type);
    var dom = document.createElement(type);
    if (props)
        Object.assign(dom, props);
    if (children) {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            if (typeof child != "string")
                dom.appendChild(child);
            else
                dom.appendChild(document.createTextNode(child));
        }
    }
    return dom;
}
//# sourceMappingURL=index.js.map