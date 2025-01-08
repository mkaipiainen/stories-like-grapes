import { Plant } from '@api/src/db/types/plant';
import { UsePlantMood } from '@/src/hooks/use-plant-mood.tsx';
import { match } from 'ts-pattern';
import healthyPlant from '@/src/assets/images/healthy-plant.webp';
import dryPlant from '@/src/assets/images/dry-plant.webp';
import deadPlant from '@/src/assets/images/dead-plant.webp';
import { useEffect, useState } from 'react';

export function UsePlantPlaceholderImage(plant: Plant | undefined) {
  const mood = UsePlantMood(plant);
  const [image, setImage] = useState(healthyPlant);

  useEffect(() => {
    setImage(
      match(mood.mood)
        .with('normal', () => {
          return healthyPlant;
        })
        .with('worried', () => {
          return dryPlant;
        })
        .with('angry', () => {
          return deadPlant;
        })
        .exhaustive(),
    );
  }, [mood.mood]);

  return image;
}
