import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

function Map({ center = [-18.8792, 47.5079], zoom = 13, height = '500px', markers = [] }) {
  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
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
            {marker.popup && <Popup dangerouslySetInnerHTML={{ __html: marker.popup }} />}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
