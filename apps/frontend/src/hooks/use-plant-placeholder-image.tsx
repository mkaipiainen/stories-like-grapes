import { Plant } from '@api/src/db/types/plant';
import { UsePlantMood } from '@/src/hooks/use-plant-mood.tsx';
import { match } from 'ts-pattern';
import plantPlaceholder from '@/src/assets/images/plant-placeholder.webp';
import worriedPlantPlaceholder from '@/src/assets/images/plant-placeholder-worried.webp';
import angryPlantPlaceholder from '@/src/assets/images/plant-placeholder-angry.webp';
import { useEffect, useState } from 'react';

export function UsePlantPlaceholderImage(plant: Plant | undefined) {
  const mood = UsePlantMood(plant);
  const [image, setImage] = useState(plantPlaceholder);

  useEffect(() => {
    setImage(
      match(mood.mood)
        .with('normal', () => {
          return plantPlaceholder;
        })
        .with('worried', () => {
          return worriedPlantPlaceholder;
        })
        .with('angry', () => {
          return angryPlantPlaceholder;
        })
        .exhaustive(),
    );
  }, [mood.mood]);

  return image;
}
