'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { getPins } from '@/api/pins';
import { Pin } from '@/types/api'; 
import { useAuth } from '@/contexts/AuthContext';
import { darkMinimalPoiStyles } from '@/config/mapStyles';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

// 初期表示の中心座標 (東京駅付近を例とする)
const center = {
  lat: 35.681236,
  lng: 139.767125,
};

const BASE_MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  styles: darkMinimalPoiStyles,
};

export default function MapContainer() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey ?? '',
  });
  const [pins, setPins] = useState<Pin[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapOptions, setMapOptions] = useState<google.maps.MapOptions>();
  const { logout } = useAuth();

  const fetchPinsForBounds = useCallback((mapInstance: google.maps.Map) => {
    const bounds = mapInstance.getBounds();
    if (!bounds) return;

    // 表示範囲の座標を取得
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    // GoバックエンドのAPIのクエリパラメータ形式に合わせる
    const boundsData = {
      ne_lat: ne.lat(),
      ne_lng: ne.lng(),
      sw_lat: sw.lat(),
      sw_lng: sw.lng(),
    };

    getPins(boundsData)
      .then(fetchedPins => setPins(fetchedPins))
      .catch(error => {
        console.error("Error fetching pins:", error);
        if (error instanceof Error) {
          const status = (error as { status?: number }).status;
          if (
            error.message === 'Authentication required' ||
            status === 401 ||
            error.message.includes('401')
          ) {
            logout();
          }
        }
      });
  }, [logout]);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    mapRef.current = mapInstance;
    // 初期ロード時にもピンを取得
    fetchPinsForBounds(mapInstance);
  }, [fetchPinsForBounds]);

  const onBoundsChanged = useCallback(() => {
    if (mapRef.current) {
      fetchPinsForBounds(mapRef.current);
    }
  }, [fetchPinsForBounds]);

  const onUnmount = useCallback(function callback() {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let isActive = true;

    (async () => {
      try {
        const { ColorScheme } = await google.maps.importLibrary('core') as google.maps.CoreLibrary;
        if (!isActive) return;

        setMapOptions({
          ...BASE_MAP_OPTIONS,
          colorScheme: ColorScheme.DARK,
        });
      } catch (error) {
        console.error('Failed to load map color scheme:', error);
        if (!isActive) return;

        setMapOptions({ ...BASE_MAP_OPTIONS });
      }
    })();

    return () => {
      isActive = false;
    };
  }, [isLoaded]);

  if (!apiKey) {
    return <div>Google Maps API key is not configured</div>;
  }

  if (loadError) {
    return <div>Failed to load map</div>;
  }

  if (!isLoaded || !mapOptions) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onBoundsChanged={onBoundsChanged}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* 取得したピンデータをMarkerとして地図上に描画 */}
      {pins.map(pin => (
        <MarkerF
          key={pin.pin_id}
          position={{ lat: pin.latitude, lng: pin.longitude }}
          // フレンド限定ピンの場合はアイコンの色を変えるなどの処理を追加可能
          // icon={{ url: pin.privacy_setting === 'friends' ? '/friend_icon.png' : '/public_icon.png' }}
          onClick={() => alert(`Pin Content: ${pin.content_text}`)}
        />
      ))}
    </GoogleMap>
  );
}
