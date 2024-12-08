import { Navigate } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';
import { trpc } from '@/util/trpc.ts';

export function PlantMinderRedirect() {
  const { isLoading, data: plants } = trpc.plant.list.useQuery();

  if (isLoading) {
    return (
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: 'lg', blur: 2 }}
        pos={'absolute'}
      />
    );
  }

  if (!plants?.length) {
    return <Navigate to="/plant-minder/new" replace />;
  }

  return <Navigate to="/plant-minder/list" replace />;
}
