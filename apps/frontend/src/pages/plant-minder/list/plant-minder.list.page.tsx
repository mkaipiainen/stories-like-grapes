import { trpc } from '@/src/util/trpc.ts';
import { Button, Image, LoadingOverlay } from '@mantine/core';
import { Link } from 'react-router-dom';
import { PlantCard } from '@/src/pages/plant-minder/list/components/plant-card.tsx';
import { UseHasRoles } from '@/src/hooks/use-has-roles.ts';
import { GUID } from '@/src/util/guid.ts';
import { ENTITY_TYPE } from '@api/src/constants/entity.constant.ts';
import { useState } from 'react';
import box from '@/src/assets/images/box.webp';
import box2 from '@/src/assets/images/box2.webp';
import box3 from '@/src/assets/images/box3.webp';
import box4 from '@/src/assets/images/box4.webp';

export function PlantMinderListPage() {
  const backgrounds = [box, box2, box3, box4];
  const trpcContext = trpc.useUtils();
  const isAdmin = UseHasRoles(['Admin']);
  const { isLoading, data } = trpc.plant.list.useQuery();
  const [activePlantId, setActivePlantId] = useState<string | null>(null);
  const createPlantMutation = trpc.plant.create.useMutation({
    onSettled: async () => {
      await trpcContext.plant.list.invalidate();
    },
  });
  const createTagsMutation = trpc.tag.create.useMutation({
    onSettled: async () => {
      await trpcContext.plant.list.invalidate();
    },
  });

  async function quickAddTestPlant() {
    const testPlant = await createPlantMutation.mutateAsync({
      name: GUID(),
      description: 'This is a description',
      watering_frequency: 5,
    });
    for (const tag of ['spray-water', 'half-shade']) {
      createTagsMutation.mutate({
        name: tag,
        entityId: testPlant.id,
        entityType: ENTITY_TYPE.PLANT,
      });
    }
  }
  return (
    <div className={'w-full h-full relative flex items-center justify-center'}>
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
      <div className={'flex flex-col h-full w-full items-center'}>
        <div
          className={
            'flex items-center flex-wrap flex-grow flex-col md:flex-row'
          }
        >
          {data?.map((plant, index) => (
            <Link
              className={'w-full md:w-1/3'}
              key={plant.id}
              to={`/plant-minder/detail/${plant.id}`}
              viewTransition={true}
              onClick={() => setActivePlantId(plant.id)}
            >
              <div
                style={{
                  viewTransitionName:
                    activePlantId === plant.id ? 'bg' : 'none',
                }}
              >
                <PlantCard
                  background={backgrounds[index % backgrounds.length]}
                  key={plant.id}
                  plant={plant}
                ></PlantCard>
              </div>
            </Link>
          ))}
        </div>
        <div className={'horizontal-divider'}></div>
        <div className={'flex items-center justify-center'}>
          <div className={'flex justify-center items-center'}>
            <Link
              to={{
                pathname: `/plant-minder/new`,
              }}
            >
              <Button>Add a plant</Button>
            </Link>
          </div>
          {isAdmin ? (
            <div className={'ml-4 flex justify-center items-center'}>
              <Button onClick={() => quickAddTestPlant()}>
                Quick-add a test-plant
              </Button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
