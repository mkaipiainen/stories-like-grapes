import {
  ActionIcon,
  Card,
  Group,
  Image,
  LoadingOverlay,
  Text,
  Title,
} from '@mantine/core';
import { S3Image } from '@/src/components/s3-image.tsx';
import { PlantWithTagsAndImages } from '@api/src/db/types/plant';
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';
import { trpc } from '@/src/util/trpc.ts';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { useViewTransitionState } from 'react-router-dom';
import { PaperDistort } from '@/src/components/paper-distort.tsx';
import { UsePlantMood } from '@/src/hooks/use-plant-mood.tsx';
import { UsePlantPlaceholderImage } from '@/src/hooks/use-plant-placeholder-image.tsx';
export function PlantCard(props: { plant: PlantWithTagsAndImages }) {
  const card = useRef<HTMLDivElement>(null);
  const dissolve = useDissolve();
  const isTransitioning = useViewTransitionState(
    `/plant-minder/detail/${props.plant.id}`,
  );

  const filterId = `filter-${props.plant.id}`;
  const trpcContext = trpc.useUtils();
  const mood = UsePlantMood(props.plant);
  const image = UsePlantPlaceholderImage(props.plant);

  const doWaterMutation = trpc.plant.water.useMutation({
    onSettled: () => {
      trpcContext.plant.list.invalidate();
    },
  });
  const deleteMutation = trpc.plant.delete.useMutation({
    onMutate: async (id: string) => {
      if (card.current) {
        await dissolve({
          element: card.current,
        });
      }
      await trpcContext.plant.list.cancel(); // Cancel any ongoing fetch for `list`
      const previousData = trpcContext.plant.list.getData();

      trpcContext.plant.list.setData(
        undefined, // Use the same arguments as the original query
        (oldData) => oldData?.filter((plant) => plant.id !== id) ?? [],
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        trpcContext.plant.list.setData(undefined, context.previousData);
      }
    },
    onSettled: async () => {
      if (card.current) {
        await dissolve({
          element: card.current,
        });
        await trpcContext.plant.list.invalidate();
      } else {
        await trpcContext.plant.list.invalidate();
      }
    },
  });

  function onDoWater() {
    doWaterMutation.mutate(props.plant.id);
  }

  function getCardClass() {
    return `flex items-center justify-center relative w-80 h-80 m-4 ${mood.mood}`;
  }

  return (
    <div className={getCardClass()} ref={card}>
      {deleteMutation.isLoading ? (
        <LoadingOverlay
          visible={true}
          zIndex={1000}
          overlayProps={{ radius: 'lg', blur: 2 }}
          pos={'absolute'}
        ></LoadingOverlay>
      ) : (
        <></>
      )}
      <ActionIcon
        color={'green'}
        onClick={() => onDoWater()}
        className={
          'shadow-action shadow-primary-foreground absolute top-0 -left-0.5 z-10'
        }
        variant="filled"
        size="lg"
        radius="xl"
        aria-label="Delete"
      >
        <FontAwesomeIcon
          size={'lg'}
          color={'white'}
          icon={faDroplet}
        ></FontAwesomeIcon>
      </ActionIcon>
      <Card
        className={
          'w-80 h-80 m-4 border-none box-border items-center hover:bg-primary-900 transition'
        }
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          filter: `url(#${filterId}) drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.2))`,
        }}
      >
        <Card.Section className={'flex-grow basis-1/2 h-1/2 max-h-1/2 w-full'}>
          {props.plant.images.length ? (
            <S3Image
              style={{
                viewTransitionName: isTransitioning ? 'plant-image' : 'none',
              }}
              id={props.plant.images[0]?.id}
            ></S3Image>
          ) : (
            <Image
              style={{
                viewTransitionName: isTransitioning ? 'plant-image' : 'none',
              }}
              src={image}
              height={160}
              alt="Plant image placeholder"
              className={'h-full object-contain'}
            />
          )}
        </Card.Section>
        <Card.Section
          className={'flex-grow flex flex-col basis-1/2 h-1/2 max-h-1/2 w-full'}
        >
          <Group justify="space-between" className={'flex-1'} mt="md" mb="xs">
            <Title size={'h5'} fw={500}>
              {props.plant.name}
            </Title>
          </Group>

          <div className={'horizontal-divider bg-primary-800'}></div>
          <div className={'h-14 flex items-center'}>
            {mood.daysUntilWatering > 0 ? (
              <Text size={'xs'}>Water in {mood.daysUntilWatering} days</Text>
            ) : (
              <Text size={'xs'}>
                <span className={'text-danger font-bold'}>
                  Water today!{' '}
                  {mood.daysSinceWatering > 0
                    ? `(${mood.daysSinceWatering} days overdue)`
                    : ''}
                </span>
              </Text>
            )}
          </div>
        </Card.Section>
      </Card>
      <PaperDistort filterId={filterId}></PaperDistort>
    </div>
  );
}
