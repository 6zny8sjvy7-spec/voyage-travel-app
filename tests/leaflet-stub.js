// Deterministic UI test double only; production loads real Leaflet.
(function(){
const layer={addTo(){return this},clearLayers(){return this},bindPopup(){return this},setView(){return this},fitBounds(){return this},invalidateSize(){return this}};
window.L={
 map(){return Object.create(layer)},
 control:{zoom(){return Object.create(layer)}},
 tileLayer(){return Object.create(layer)},
 layerGroup(){return Object.create(layer)},
 marker(){return Object.create(layer)},
 divIcon(options){return options},
 latLngBounds(){return {pad(){return this}}}
};
})();
