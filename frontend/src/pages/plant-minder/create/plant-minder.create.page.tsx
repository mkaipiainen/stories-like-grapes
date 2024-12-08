import { NewPlantForm } from '@/pages/plant-minder/components/new-plant-form.tsx';

export function PlantMinderCreatePage() {
  return (
    <>
      <div className={'flex flex-col h-full w-full'}>
        <NewPlantForm></NewPlantForm>
      </div>
    </>
  );
}
