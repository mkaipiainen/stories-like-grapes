import { NewPlantForm } from '@/pages/plant-minder/components/new-plant-form.tsx';
import { trpc } from '@/util/trpc.ts';
import { LoadingOverlay } from '@mantine/core';

export function PlantMinderPage() {
  const { isLoading, data } = trpc.plant.list.useQuery();
  return (
    <>
      {isLoading ? (
        <LoadingOverlay
          visible={true}
          zIndex={1000}
          overlayProps={{ radius: 'lg', blur: 2 }}
          pos={'absolute'}
        ></LoadingOverlay>
      ) : (
        <></>
      )}
      <pre>{data?.map((datum) => datum.name)}</pre>
      <div className={'flex flex-col h-full w-full'}>
        <NewPlantForm></NewPlantForm>
      </div>
    </>
  );
}
