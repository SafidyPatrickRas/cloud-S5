import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
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

const getStatusClass = (status = '') => {
  const value = String(status).toUpperCase()
  if (value === 'EN_COURS') return 'status-en-cours'
  if (value === 'TERMINE') return 'status-termine'
  return 'status-nouveau'
}

const createStatusIcon = (status) =>
  L.divIcon({
    className: `custom-marker ${getStatusClass(status)}`,
    html: '<div class="marker-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

function Map({ center = [-18.8792, 47.5079], zoom = 13, height = '500px', markers = [], onMarkerClick }) {
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
          <Marker 
            key={index} 
            position={marker.position}
            icon={createStatusIcon(marker?.data?.status)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick && marker.data) {
                  onMarkerClick(marker.data);
                }
              },
              mouseover: (e) => {
                if (marker.popup) {
                  e.target.openPopup();
                }
              },
              mouseout: (e) => {
                if (marker.popup) {
                  e.target.closePopup();
                }
              }
            }}
          >
            {/* Tooltip permanent pour afficher le status */}
            {marker.tooltip && (
              <Tooltip 
                permanent={marker.tooltipPermanent !== false} 
                direction="top"
                offset={[0, -40]}
                className="custom-tooltip"
              >
                <div dangerouslySetInnerHTML={{ __html: marker.tooltip }} />
              </Tooltip>
            )}
            {/* Popup pour les détails au survol/clic */}
            {marker.popup && (
              <Popup closeButton={false}>
                <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
