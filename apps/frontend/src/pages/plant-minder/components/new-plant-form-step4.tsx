import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { useAppSelector} from '@/src/stores/store.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {
  Button,
  Group,
  Text
} from '@mantine/core';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { useNavigate } from 'react-router-dom';
import {trpc} from "@/src/util/trpc.ts";
import {notifications} from "@mantine/notifications";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";
import {Dropzone, IMAGE_MIME_TYPE} from "@mantine/dropzone";
import {faCamera, faCancel} from "@fortawesome/free-solid-svg-icons";
type Inputs = {
  description: string;
};

export function NewPlantFormStep4() {
  const step4 = useRef<HTMLFormElement | null>(null);
  const dissolve = useDissolve();
  const navigate = useNavigate();
  const { handleSubmit } = useForm<Inputs>();
  const {mutateAsync, isLoading} = trpc.plant.create.useMutation();
  const tags = useAppSelector((state) => state.newPlantReducer.tags);
  const name = useAppSelector((state) => state.newPlantReducer.name);
  const description = useAppSelector(
      (state) => state.newPlantReducer.description,
  );
  const wateringFrequency = useAppSelector(
      (state) => state.newPlantReducer.wateringFrequency,
  );

  function onSubmit() {
    mutateAsync({
      name,
      description,
      watering_frequency:
          typeof wateringFrequency === 'string'
              ? parseInt(wateringFrequency)
              : wateringFrequency,
      tags,
    }).then(() => {
      notifications.show({
        title: 'Success!',
        message: 'Added a new plant!',
        color: 'green',
        position: 'top-center',
        icon: <FontAwesomeIcon color={'white'} icon={faCheck}></FontAwesomeIcon>,
        autoClose: 2000,
      });
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={'flex flex-col items-start'}
      ref={step4}
    >
      <Dropzone
          onDrop={(files) => console.log('accepted files', files)}
          onReject={(files) => console.log('rejected files', files)}
          maxSize={5 * 1024 ** 2}
          accept={IMAGE_MIME_TYPE}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <FontAwesomeIcon size={'xl'} icon={faCheck}></FontAwesomeIcon>
          </Dropzone.Accept>
          <Dropzone.Reject>
            <FontAwesomeIcon size={'xl'} icon={faCancel}></FontAwesomeIcon>
          </Dropzone.Reject>
          <Dropzone.Idle>
            <FontAwesomeIcon size={'xl'} icon={faCamera}></FontAwesomeIcon>
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag images here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Button
        type={'submit'}
        className={
          'hover:bg-primary-800 transition-colors cursor-pointer w-full mt-4'
        }
        disabled={isLoading}
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
