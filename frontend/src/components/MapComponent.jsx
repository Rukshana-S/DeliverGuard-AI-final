import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* Recenter map when coords change (geolocation resolves after mount) */
function Recenter({ center }) {
  const map = useMap();
  const prev = useRef(center);
  useEffect(() => {
    if (prev.current[0] !== center[0] || prev.current[1] !== center[1]) {
      map.setView(center, map.getZoom());
      prev.current = center;
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({ center = [19.076, 72.877], disruptions = [] }) {
  /* Only render circles for disruptions that carry location coords */
  const locatedDisruptions = disruptions.filter(
    (d) => d.location?.lat != null && d.location?.lon != null
  );

  return (
    <MapContainer center={center} zoom={12} className="w-full h-80 rounded-xl z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Recenter center={center} />
      <Marker position={center}>
        <Popup>Your Location</Popup>
      </Marker>
      {locatedDisruptions.map((d, i) => (
        <Circle
          key={i}
          center={[d.location.lat, d.location.lon]}
          radius={2000}
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
        >
          <Popup>{d.type?.replace(/_/g, ' ').toUpperCase() || d.eventType?.replace(/_/g, ' ').toUpperCase()}</Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
