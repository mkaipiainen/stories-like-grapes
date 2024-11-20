import { useQuill } from 'react-quilljs';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store.ts';
import {
  setDescription,
  setStep,
  setTags,
} from '@store/slices/new-plant-slice.ts';
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
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { faCloudSun } from '@fortawesome/free-solid-svg-icons/faCloudSun';
import { faSprayCanSparkles } from '@fortawesome/free-solid-svg-icons/faSprayCanSparkles';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
type Inputs = {
  description: string;
};

const TAGS: Record<string, { label: string; icon: IconDefinition }> = {
  light: {
    label: 'Lots of light',
    icon: faSun,
  },
  'half-shade': {
    label: 'Half shade',
    icon: faCloudSun,
  },
  'full-shade': {
    label: 'Full shade',
    icon: faCloud,
  },
  'spray-water': {
    label: 'Spray water',
    icon: faSprayCanSparkles,
  },
} as const;

const TAG_OPTIONS: (keyof typeof TAGS)[] = Object.keys(
  TAGS,
) as unknown as (keyof typeof TAGS)[];

export function NewPlantFormStep3() {
  const [opened, { open, close }] = useDisclosure(false);

  const { quill, quillRef } = useQuill();
  const tags = useAppSelector((state) => state.newPlantReducer.tags);
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm<Inputs>();
  const [temporaryTags, setTemporaryTags] = useState<string[]>([]);
  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        dispatch(setDescription(quill.root.innerHTML));
      });
    }
    return () => {
      if (quill) {
        quill.off('text-change');
      }
    };
  }, [quill]);

  function onSubmit() {
    dispatch(setStep(3));
  }

  function acceptTags(selectedTags: string[]) {
    console.log(selectedTags);
    dispatch(setTags([...selectedTags]));
    setTemporaryTags([]);
    close();
  }

  function onTagChange(selectedTags: string[]) {
    setTemporaryTags(selectedTags);
  }
  const renderMultiSelectOption: MultiSelectProps['renderOption'] = ({
    option,
  }) => (
    <Group gap="sm">
      <FontAwesomeIcon icon={TAGS[option.value].icon}></FontAwesomeIcon>
      <Text size="xs" opacity={0.5}>
        {TAGS[option.value].label}
      </Text>
    </Group>
  );
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={'flex flex-col items-start'}
    >
      <div className={'flex flex-col'}>
        <Button onClick={open}>Add some tags</Button>
        <Modal opened={opened} onClose={close} title="Add tags">
          <div className={'flex mb-4'}>
            <MultiSelect
              placeholder="Add a tag..."
              onChange={onTagChange}
              data={TAG_OPTIONS}
              renderOption={renderMultiSelectOption}
            />
          </div>
          <Button onClick={() => acceptTags(temporaryTags)}>Accept</Button>
        </Modal>
        <div className={'flex flex-wrap'}>
          {tags.map((tag) => (
            <Chip defaultChecked size="xs" className={'m-1'}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>

      <div
        className={'border flex w-full justify-center items-center mb-4 mt-4'}
      >
        <span
          className={
            'bg-primary absolute w-20 flex justify-center items-center'
          }
        >
          and/or
        </span>
      </div>

      <div className={'mb-4 flex items-center'}>
        <span className={'mr-4 font-bold'}>
          Enter the description for your plant:
        </span>
      </div>
      <div
        {...register('description')}
        className="min-h-40 w-full"
        ref={quillRef}
      />
      <Button
        type={'submit'}
        className={
          'hover:bg-primary-800 transition-colors cursor-pointer w-full mt-4'
        }
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
