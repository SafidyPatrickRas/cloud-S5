import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';

// Fix pour les icônes de marqueurs Leaflet avec Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Composant pour capturer les coordonnées du curseur
function CursorCoordinates({ onCoordinatesChange }) {
  useMapEvents({
    mousemove: (e) => {
      onCoordinatesChange(e.latlng);
    },
    mouseout: () => {
      onCoordinatesChange(null);
    }
  });
  return null;
}

function Map({ center = [-18.8792, 47.5079], zoom = 13, height = '500px', markers = [] }) {
  const [cursorPosition, setCursorPosition] = useState(null);

  return (
    <div className="map-wrapper" style={{ height }}>
      {/* Affichage des coordonnées */}
      {cursorPosition && (
        <div className="coordinates-display">
          <strong>Latitude:</strong> {cursorPosition.lat.toFixed(6)} | 
          <strong> Longitude:</strong> {cursorPosition.lng.toFixed(6)}
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Capturer les coordonnées du curseur */}
        <CursorCoordinates onCoordinatesChange={setCursorPosition} />
        
        {/* Utiliser le serveur de tuiles local - format raster PNG */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={10}
        />
        
        {/* Afficher les marqueurs si fournis */}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {/* Tooltip au survol */}
            {marker.tooltip && (
              <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                <div dangerouslySetInnerHTML={{ __html: marker.tooltip }} />
              </Tooltip>
            )}
            {/* Popup au clic */}
            {marker.popup && <Popup dangerouslySetInnerHTML={{ __html: marker.popup }} />}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
