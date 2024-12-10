import { useQuill } from 'react-quilljs';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/stores/store.ts';
import {
  setDescription,
  setTags,
} from '@/src/stores/slices/new-plant-slice.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {
  Button,
  Chip,
  Group,
  Modal,
  MultiSelect,
  MultiSelectProps,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { trpc } from '@/src/util/trpc.ts';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import {UseCreatePlant} from "@/src/pages/plant-minder/hooks/use-create-plant.hook.tsx";
type Inputs = {
  description: string;
};


const TAG_OPTIONS: (keyof typeof TAGS)[] = Object.keys(
  TAGS,
) as unknown as (keyof typeof TAGS)[];

export function NewPlantFormStep3() {
  const step4 = useRef<HTMLFormElement | null>(null);
  const dissolve = useDissolve();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm<Inputs>();
  const [temporaryTags, setTemporaryTags] = useState<string[]>([]);
  const createPlant = UseCreatePlant();
  function onSubmit() {
    createPlant()
      .then(() => {
        setTimeout(() => {
          dissolve({
            duration: 500,
            element: step4.current as HTMLElement,
            removeFromFlow: true,
          }).then(() => {
            navigate('/plant-minder/list');
          });
        }, 1000);
      });
  }

  function acceptTags(selectedTags: string[]) {
    dispatch(setTags([...selectedTags]));
    setTemporaryTags([]);
    close();
  }

  function onTagChange(selectedTags: string[]) {
    setTemporaryTags(selectedTags);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={'flex flex-col items-start'}
      ref={step4}
    >
      <Button
        type={'submit'}
        className={
          'hover:bg-primary-800 transition-colors cursor-pointer w-full mt-4'
        }
        disabled={mutation.isLoading}
        variant="outline"
        size="icon"
      >
        <Group>
          <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
          Submit plant
        </Group>
      </Button>
    </form>
  );
}
