import { NewPlantForm } from '@/pages/plant-minder/components/new-plant-form.tsx';
import { graphql } from '@/gql';
import { useQuery } from '@apollo/client';

const GET_PLANTS = graphql(/* GraphQL */ `
  query Plants {
    Plants {
      id
      name
      wateringInterval
      lastWatered
      tags
    }
  }
`);

export function PlantMinderPage() {
  const { loading, error, data } = useQuery(GET_PLANTS);

  return (
    <div className={'flex flex-col h-full w-full'}>
      <NewPlantForm></NewPlantForm>
    </div>
  );
}
