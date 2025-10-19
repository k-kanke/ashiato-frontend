'use client';

import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MapContainer, { MapContainerHandle } from '@/components/MapContainer';
import TabBar from '@/components/TabBar';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function MapPage() {
  const auth = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = useRef<MapContainerHandle>(null);
  const [shouldOpenCreate, setShouldOpenCreate] = useState(false);
  const [isThreadActive, setIsThreadActive] = useState(false);

  useEffect(() => {
    if (!auth.isInitializing && auth.isAuthenticated) {
      const createParam = searchParams?.get('create');
      if (createParam === '1') {
        setShouldOpenCreate(true);
      }
    }
  }, [auth.isAuthenticated, auth.isInitializing, searchParams]);

  useEffect(() => {
    if (shouldOpenCreate && mapRef.current) {
      mapRef.current.openCreatePinSheet();
      setShouldOpenCreate(false);
      router.replace('/map');
    }
  }, [shouldOpenCreate, router]);

  const handleCreateClick = useCallback(() => {
    mapRef.current?.openCreatePinSheet();
  }, []);

  if (auth.isInitializing) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading map...</div>;
  }

  if (!auth.isAuthenticated || !auth.token) {
    return null;
  }

  const pageStyle: CSSProperties = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0b101f',
    overflow: 'hidden',
  };

  const mapWrapperStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  return (
    <div style={pageStyle}>
      <div style={mapWrapperStyle}>
        <MapContainer
          ref={mapRef}
          onThreadOpenChange={setIsThreadActive}
        />
      </div>
      {!isThreadActive && <TabBar activeTab="map" onCreateClick={handleCreateClick} />}
    </div>
  );
}
