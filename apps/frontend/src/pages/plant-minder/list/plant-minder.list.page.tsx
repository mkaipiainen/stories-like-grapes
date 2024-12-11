import { trpc } from '@/src/util/trpc.ts';
import {
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Text,
  Image,
} from '@mantine/core';
import { Plant } from '../../../../../api/src/db/types/plant';
import { Link } from 'react-router-dom';

export function PlantMinderListPage() {
  const { isLoading, data } = trpc.plant.list.useQuery();
  function getCard(plant: Plant) {
    return (
      <Card
        className={'w-80 m-4'}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <Card.Section>
          <Image
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
            height={160}
            alt="Norway"
          />
        </Card.Section>

        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>{plant.name}</Text>
        </Group>

        <Group justify="space-between" mt="md" mb="xs">
          {plant.tags.map((tag) => (
            <Badge color="pink">{tag.name}</Badge>
          ))}
        </Group>

        <Link
          to={{
            pathname: `/plant-minder/detail/${plant.id}`,
          }}
        >
          <Button color="blue" fullWidth mt="md" radius="md">
            Edit
          </Button>
        </Link>
      </Card>
    );
  }
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
      <div className={'flex items-center'}>
        {data?.map((datum) => getCard(datum))}
      </div>
    </>
  );
}
