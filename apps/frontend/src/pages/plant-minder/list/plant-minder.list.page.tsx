import { trpc } from '@/src/util/trpc.ts';
import {
  Button,
  LoadingOverlay,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {PlantCard} from "@/src/pages/plant-minder/list/components/plant-card.tsx";

export function PlantMinderListPage() {
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
      <div className={'flex flex-col h-full w-full items-center'}>
          <div className={'flex items-center flex-wrap flex-grow'}>
            {data?.map((datum) => <PlantCard plant={datum}></PlantCard>)}
          </div>
          <div className={'horizontal-divider'}>
          </div>
          <div className={'flex justify-center items-center'}>
              <Link                to={{
                  pathname: `/plant-minder/new`,
              }}>
                  <Button>Add a plant</Button>
              </Link>

          </div>
      </div>
    </>
  );
}
