import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";


const icon = L.icon({
  iconUrl: "./location.png",
  iconSize: [40, 40]
});
const position = [-18.822733, 47.171147];
function ResetCenterView(props) {
  const { selectPosition } = props;
  const map = useMap();
  useEffect(() => {
    if (selectPosition) {
      map.setView(
        L.latLng(selectPosition?.lat, selectPosition?.lon),
        map.getZoom(),
        {
          animate: true,
        }
      )
    }
  }, [selectPosition]);

  return null;
}

export default function CarteLeaflet(props) {
  const { selectPosition } = props;
  const locationSelection = [selectPosition?.lat, selectPosition?.lon];

  return (
    <MapContainer center={position} zoom={6.4} style={{ width: "100%", height: "100%",boxShadow:'4px 4px 10px rgba(0, 0, 0, 0.2)' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://api.maptiler.com/maps/topo-v2/256/{z}/{x}/{y}.png?key=vbdUPhtNPokkRlCqiG7n"
      />
      {selectPosition && (

        <Marker position={locationSelection} icon={icon}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      )}
      <ResetCenterView selectPosition={selectPosition} />
    </MapContainer>
  )
}


