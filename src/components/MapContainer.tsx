'use client';

import React, { useState, useCallback, useRef, useEffect, FormEvent } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { createPin, getPins } from '@/api/pins';
import { Pin } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { darkMinimalPoiStyles } from '@/components/ui/mapStyles';
import CreatePinSheet, {
  CreatePinState,
  PrivacySetting,
  createInitialState,
} from '@/components/CreatePinSheet';
import { fabStyle } from '@/components/ui/styles';
import PinSummarySheet from '@/components/PinSummarySheet';
import ThreadModal from '@/components/ThreadModal';

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
  const [createPinState, setCreatePinState] = useState<CreatePinState>(() => createInitialState());
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
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

  const handleCreatePinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createPinState.latitude === null || createPinState.longitude === null) {
      setCreatePinState(prev => ({
        ...prev,
        error: '現在地が未取得のため、投稿できません。',
      }));
      return;
    }

    if (!createPinState.contentText.trim()) {
      setCreatePinState(prev => ({
        ...prev,
        error: 'テキストを入力してください。',
      }));
      return;
    }

    setCreatePinState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null,
    }));

    try {
      // console.log("debug", createPinState.latitude, createPinState.longitude, createPinState.contentText.trim(), createPinState.privacySetting)
      const newPin = await createPin({
        latitude: createPinState.latitude,
        longitude: createPinState.longitude,
        content_text: createPinState.contentText.trim(),
        media_url: null,
        privacy_setting: createPinState.privacySetting,
      });

      if (mapRef.current) {
        fetchPinsForBounds(mapRef.current);
        mapRef.current.panTo({
          lat: createPinState.latitude,
          lng: createPinState.longitude,
        });
      } else {
        setPins(prev => [newPin, ...prev]);
      }

      setCreatePinState(createInitialState());
    } catch (error) {
      console.error('Failed to create pin:', error);

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

      setCreatePinState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'ピンの投稿に失敗しました。時間を置いて再度お試しください。',
      }));
    }
  };

  const handleFabClick = () => {
    if (!navigator.geolocation) {
      setCreatePinState(prev => ({
        ...prev,
        isOpen: true,
        isLocating: false,
        error: 'このブラウザでは位置情報を取得できません。',
      }));
      return;
    }

    setCreatePinState(prev => ({
      ...prev,
      isOpen: true,
      isLocating: true,
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        setCreatePinState(prev => ({
          ...prev,
          isLocating: false,
          latitude,
          longitude,
        }));

        if (mapRef.current) {
          mapRef.current.panTo({ lat: latitude, lng: longitude });
        }
      },
      error => {
        console.error('Geolocation error:', error);
        setCreatePinState(prev => ({
          ...prev,
          isLocating: false,
          error: '現在地を取得できませんでした。位置情報の権限をご確認ください。',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <>
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
            onClick={() => {
              setSelectedPin(pin);
              setIsThreadOpen(false);
            }}
          />
        ))}
      </GoogleMap>
      <button
        type="button"
        style={fabStyle}
        onClick={handleFabClick}
        aria-label="ピンを追加する"
      >
        +
      </button>
      <CreatePinSheet
        state={createPinState}
        onClose={() => setCreatePinState(createInitialState())}
        onSubmit={handleCreatePinSubmit}
        onContentChange={(value: string) =>
          setCreatePinState(prev => ({
            ...prev,
            contentText: value,
          }))
        }
        onPrivacyChange={(value: PrivacySetting) =>
          setCreatePinState(prev => ({
            ...prev,
            privacySetting: value,
          }))
        }
      />
      <PinSummarySheet
        pin={isThreadOpen ? null : selectedPin}
        onClose={() => {
          setSelectedPin(null);
          setIsThreadOpen(false);
        }}
        onShowThread={() => {
          if (selectedPin) {
            setIsThreadOpen(true);
          }
        }}
      />
      <ThreadModal
        pin={selectedPin}
        isOpen={isThreadOpen && !!selectedPin}
        onClose={() => {
          setIsThreadOpen(false);
        }}
      />
    </>
  );
}
