import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { bcmm } from '../../theme/bcmm';

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const latlngs = points.map((p) => [p.lat, p.lon]);
    if (latlngs.length === 1) {
      map.setView(latlngs[0], 10);
      return;
    }
    map.fitBounds(latlngs, { padding: [24, 24], maxZoom: 12 });
  }, [map, points]);
  return null;
}

export default function TerrainObsMap({ observations = [], height = 280 }) {
  const points = (observations || [])
    .map((o) => ({
      id: o.id,
      lon: Number(o.lon),
      lat: Number(o.lat),
      substance: o.substance,
      note: o.note,
      syncedAt: o.synced_at,
    }))
    .filter((p) => Number.isFinite(p.lon) && Number.isFinite(p.lat));

  const center = points.length
    ? [points[0].lat, points[0].lon]
    : [-18.9, 47.5];

  return (
    <div style={{ height, width: '100%', border: `1px solid ${bcmm.surface.border}` }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={7}
            pathOptions={{
              color: bcmm.brand.primary,
              fillColor: bcmm.brand.primary,
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Popup>
              <strong>{p.substance || 'Observation'}</strong>
              <br />
              {p.note || 'Sans note'}
              <br />
              <small>{p.syncedAt ? new Date(p.syncedAt).toLocaleString() : ''}</small>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
