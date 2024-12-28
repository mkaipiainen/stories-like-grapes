import { useForm, UseFormReturn } from 'react-hook-form';
import { Dispatch, SetStateAction, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { Button, Group, Text } from '@mantine/core';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { useNavigate } from 'react-router-dom';
import { trpc } from '@/src/util/trpc.ts';
import { notifications } from '@mantine/notifications';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { faCamera, faCancel } from '@fortawesome/free-solid-svg-icons';
import { NewPlantFormInputs } from '@/src/pages/plant-minder/components/new-plant-form.tsx';
import { Step } from '@/src/stores/slices/new-plant-slice.ts';
import { ENTITY_TYPE } from '@api/src/constants/entity.constant.ts';
import { UseFileUpload } from '@/src/hooks/use-file-upload.tsx';

export function NewPlantFormStep4(props: {
  form: UseFormReturn<NewPlantFormInputs>;
  setTransitionTarget: Dispatch<SetStateAction<Step>>;
}) {
  const step4 = useRef<HTMLFormElement | null>(null);
  const dissolve = useDissolve();
  const navigate = useNavigate();
  const { handleSubmit } = useForm();
  const plantMutation = trpc.plant.create.useMutation();
  const tagMutation = trpc.tag.create.useMutation();
  const { doUpload } = UseFileUpload();
  async function onSubmit() {
    try {
      const data = props.form.getValues();
      const plant = await plantMutation.mutateAsync({
        description: data.description,
        name: data.name,
        watering_frequency: parseInt(data.wateringFrequency),
      });
      const image = props.form.getValues('image');
      const tags = props.form.getValues('tags');
      if (image) {
        await doUpload(image, {
          id: plant.id,
          type: ENTITY_TYPE.PLANT,
        });
      }
      if (tags) {
        await Promise.all(
          tags.map((tag) => {
            return tagMutation.mutateAsync({
              name: tag,
              entityId: plant.id,
              entityType: ENTITY_TYPE.PLANT,
            });
          }),
        );
      }

      notifications.show({
        title: 'Success!',
        message: 'Added a new plant!',
        color: 'green',
        position: 'top-center',
        icon: (
          <FontAwesomeIcon color={'white'} icon={faCheck}></FontAwesomeIcon>
        ),
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
    } catch (e) {
      console.log('Error:', e);
      notifications.show({
        title: 'Error!',
        message: 'There was an error adding the new plant.',
        color: 'red',
        position: 'top-center',
        icon: (
          <FontAwesomeIcon color={'white'} icon={faCancel}></FontAwesomeIcon>
        ),
        autoClose: 2000,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={'flex flex-col items-start'}
      ref={step4}
    >
      <Dropzone
        onDrop={(files) => {
          props.form.setValue('image', files[0]);
        }}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
      >
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: 'none' }}
        >
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
        disabled={plantMutation.isLoading}
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
