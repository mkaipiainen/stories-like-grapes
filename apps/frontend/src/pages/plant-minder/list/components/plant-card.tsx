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
import { useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';
import { trpc } from '@/src/util/trpc.ts';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { useViewTransitionState } from 'react-router-dom';
import { UsePlantMood } from '@/src/hooks/use-plant-mood.tsx';
import { UsePlantPlaceholderImage } from '@/src/hooks/use-plant-placeholder-image.tsx';
export function PlantCard(props: {
  plant: PlantWithTagsAndImages;
  background: string;
}) {
  const card = useRef<HTMLDivElement>(null);
  const dissolve = useDissolve();
  const isTransitioning = useViewTransitionState(
    `/plant-minder/detail/${props.plant.id}`,
  );

  const filterId = `filter-${props.plant.id}`;
  const trpcContext = trpc.useUtils();
  const mood = UsePlantMood(props.plant);
  const image = UsePlantPlaceholderImage(props.plant);
  const mainImage = useMemo(() => {
    return props.plant.images.find((image) => image.is_main_image);
  }, [props.plant.images]);

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
    return `flex items-center p-2 justify-center relative w-72 h-72 max-w-72 min-h-72 max-h-72 m-4 ${mood.mood}`;
  }

  return (
    <div className={getCardClass()} ref={card}>
      <div
        className={'flex items-center justify-center relative w-full h-full'}
      >
        <Image
          src={props.background}
          className={
            'absolute top-0 left-0 w-full h-full z-10 object-fill drop-shadow-2xl'
          }
        ></Image>
        {deleteMutation.isPending ? (
          <LoadingOverlay
            visible={true}
            zIndex={1000}
            overlayProps={{ radius: 'lg', blur: 2 }}
            pos={'absolute'}
          ></LoadingOverlay>
        ) : (
          <></>
        )}
        <Card
          className={
            'h-full w-full border-none box-border items-center hover:bg-primary-900 transition'
          }
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
        >
          <Card.Section className={'flex-grow h-1/2 basis-1/2 w-full m-0 flex'}>
            <Image
              style={{
                viewTransitionName: isTransitioning ? 'plant-image' : 'none',
              }}
              src={image}
              height={160}
              alt="Plant image placeholder"
              className={'h-full object-contain flex-grow w-2/5'}
            />
            {mainImage ? (
              <>
                <div className={'vertical-divider bg-tertiary-800'}></div>
                <S3Image
                  className={'flex-grow w-2/5'}
                  style={{
                    viewTransitionName: isTransitioning
                      ? 'plant-image'
                      : 'none',
                  }}
                  id={mainImage.id}
                ></S3Image>
              </>
            ) : (
              <></>
            )}
          </Card.Section>
          <Card.Section
            className={'flex-grow flex flex-col basis-1/2 w-full m-0'}
          >
            <Group
              justify="space-between"
              className={'flex-1 h-12 min-h-12'}
              mt="xs"
            >
              <Title size={'h5'} fw={500}>
                {props.plant.name}
              </Title>
            </Group>

            <div className={'horizontal-divider bg-primary-800'}></div>
            <div className={'h-14 flex items-center justify-between'}>
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
              <ActionIcon
                color={'green'}
                onClick={() => onDoWater()}
                className={'shadow-action shadow-primary-foreground'}
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
            </div>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
}
