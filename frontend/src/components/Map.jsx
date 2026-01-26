import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// IMPORTS OBLIGATOIRES POUR VITE
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// FIX LEAFLET
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function Map({ center, zoom, height, markers = [], onMarkerClick }) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) onMarkerClick(marker.data)
            }
          }}
        >
          <Popup>
            {marker.tooltip || 'Information'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default Map
