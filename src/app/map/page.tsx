'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapContainer from '@/components/MapContainer';
import { useAuth } from '@/contexts/AuthContext';

export default function MapPage() {
  const { isAuthenticated, token, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading map...</div>;
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return (
    <div className="w-screen h-screen">
      <MapContainer />
    </div>
  );
}
