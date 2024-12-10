import { trpc } from '@/src/util/trpc.ts';
import { useParams } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';

export function PlantMinderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoading } = trpc.plant.get.useQuery(id ?? '');
  if (isLoading) {
    return (
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: 'lg', blur: 2 }}
        pos={'absolute'}
      ></LoadingOverlay>
    );
  }
  return (
    <>
      <div className={'flex flex-col h-full w-full'}></div>
    </>
  );
}
