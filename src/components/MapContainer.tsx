'use client';

import React, { useState, useCallback, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { createPin, getPins } from '@/api/pins';
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

type PrivacySetting = 'public' | 'friends';

type CreatePinState = {
  isOpen: boolean;
  isLocating: boolean;
  isSubmitting: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  contentText: string;
  privacySetting: PrivacySetting;
};

const createInitialState = (): CreatePinState => ({
  isOpen: false,
  isLocating: false,
  isSubmitting: false,
  error: null,
  latitude: null,
  longitude: null,
  contentText: '',
  privacySetting: 'public',
});

const fabStyle: React.CSSProperties = {
  position: 'fixed',
  right: '24px',
  bottom: '24px',
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  border: 'none',
  background: '#3f4d9b',
  color: '#ffffff',
  fontSize: '32px',
  lineHeight: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
  zIndex: 2,
};

const sheetBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  zIndex: 3,
};

const sheetStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#1d1d25',
  color: '#f2f2f5',
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',
  padding: '24px',
  boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.35)',
  zIndex: 4,
};

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  marginBottom: '6px',
  color: '#a8a8b3',
};

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #3a3a43',
  backgroundColor: '#2a2a33',
  color: '#f2f2f5',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const disabledInputStyle: React.CSSProperties = {
  ...inputBaseStyle,
  opacity: 0.7,
  cursor: 'not-allowed',
};

const errorStyle: React.CSSProperties = {
  color: '#ff6b6b',
  fontSize: '13px',
  marginTop: '8px',
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
            onClick={() => alert(`Pin Content: ${pin.content_text}`)}
          />
        ))}
      </GoogleMap>
      <button
        type="button"
        style={fabStyle}
        onClick={() => {
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
        }}
        aria-label="ピンを追加する"
      >
        +
      </button>

      {createPinState.isOpen && (
        <>
          <div
            style={sheetBackdropStyle}
            role="presentation"
            onClick={() => setCreatePinState(createInitialState())}
          />
          <div style={sheetStyle}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>新しい足跡を残す</h2>
            <form
              onSubmit={async (event: FormEvent<HTMLFormElement>) => {
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
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <label style={fieldLabelStyle}>現在地</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    style={disabledInputStyle}
                    value={
                      createPinState.latitude !== null
                        ? createPinState.latitude.toFixed(6)
                        : createPinState.isLocating
                          ? '現在地を取得中...'
                          : ''
                    }
                    disabled
                  />
                  <input
                    style={disabledInputStyle}
                    value={
                      createPinState.longitude !== null
                        ? createPinState.longitude.toFixed(6)
                        : createPinState.isLocating
                          ? '現在地を取得中...'
                          : ''
                    }
                    disabled
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={fieldLabelStyle} htmlFor="pin-content">
                  メモ
                </label>
                <textarea
                  id="pin-content"
                  style={{ ...inputBaseStyle, minHeight: '96px', resize: 'vertical' }}
                  placeholder="今いる場所での思い出を書き残しましょう"
                  value={createPinState.contentText}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setCreatePinState(prev => ({
                      ...prev,
                      contentText: event.target.value,
                    }))
                  }
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={fieldLabelStyle} htmlFor="pin-privacy">
                  公開範囲
                </label>
                <select
                  id="pin-privacy"
                  style={inputBaseStyle}
                  value={createPinState.privacySetting}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setCreatePinState(prev => ({
                      ...prev,
                      privacySetting: event.target.value as PrivacySetting,
                    }))
                  }
                >
                  <option value="public">公開</option>
                  <option value="friends">フレンド限定</option>
                </select>
              </div>

              {createPinState.error && (
                <div style={errorStyle} role="alert">
                  {createPinState.error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setCreatePinState(createInitialState())}
                  style={{
                    ...inputBaseStyle,
                    backgroundColor: '#262630',
                    borderColor: '#3a3a43',
                    textAlign: 'center',
                  }}
                  disabled={createPinState.isSubmitting}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  style={{
                    ...inputBaseStyle,
                    backgroundColor: createPinState.isSubmitting ? '#4e4e58' : '#4857c4',
                    borderColor: 'transparent',
                    cursor: createPinState.isSubmitting ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                  }}
                  disabled={
                    createPinState.isSubmitting ||
                    createPinState.latitude === null ||
                    createPinState.longitude === null ||
                    !createPinState.contentText.trim()
                  }
                >
                  {createPinState.isSubmitting ? '投稿中…' : '投稿'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
