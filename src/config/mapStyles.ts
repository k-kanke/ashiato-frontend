// ashiato-frontend/src/config/mapStyles.ts

// Stylized dark map styling that keeps user pins prominent by hiding most POIs and simplifying colors.
type MapTypeStyle = google.maps.MapTypeStyle;

export const darkMinimalPoiStyles: MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#141419' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f2f2f5' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#141419' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#25242d' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d7d7db' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a1a21' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#101016' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.landmark',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f7d977' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#14251d' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2b2a33' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a20' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3d3b47' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f1e26' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#3f4d9b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#aab7ff' }],
  },
  {
    featureType: 'transit.station.rail',
    elementType: 'geometry',
    stylers: [{ color: '#4857c4' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#4857c4' }, { lightness: -25 }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e2437' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#527da7' }],
  },
];

