import { useQuill } from 'react-quilljs';
import {useForm, UseFormReturn} from 'react-hook-form';
import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';
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
import {NewPlantFormInputs} from "@/src/pages/plant-minder/components/new-plant-form.tsx";
import {Step} from "@/src/stores/slices/new-plant-slice.ts";
import {TAG_OPTIONS, TAGS} from "@/src/constants/tags.ts";
type Inputs = {
  description: string;
};

export function NewPlantFormStep3(props: {
  form: UseFormReturn<NewPlantFormInputs>,
  setTransitionTarget: Dispatch<SetStateAction<Step>>;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const { quill, quillRef } = useQuill();
  const step3 = useRef<HTMLFormElement | null>(null);
  const { register, handleSubmit } = useForm<Inputs>();
  const [temporaryTags, setTemporaryTags] = useState<string[]>([]);
  const tagWatcher = props.form.watch('tags');
  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        props.form.setValue('description', quill.root.innerHTML);
      });
    }
    return () => {
      if (quill) {
        quill.off('text-change');
      }
    };
  }, [quill]);

  function onSubmit() {
    props.setTransitionTarget(4);
  }

  function acceptTags(selectedTags: string[]) {
    props.form.setValue('tags', [...selectedTags])
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
      ref={step3}
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
          {tagWatcher.map((tag) => (
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
          Next step
        </Group>
      </Button>
    </form>
  );
}
