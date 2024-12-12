import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {useForm, UseFormReturn} from 'react-hook-form';
import { Button, TextInput } from '@mantine/core';
import {NewPlantFormInputs} from "@/src/pages/plant-minder/components/new-plant-form.tsx";
import {Dispatch, SetStateAction, useCallback} from "react";
import {Step} from "@/src/stores/slices/new-plant-slice.ts";

export function NewPlantFormStep1(props: {
  form: UseFormReturn<NewPlantFormInputs>,
  setTransitionTarget: Dispatch<SetStateAction<Step>>;
}) {
  const { handleSubmit } = useForm();
  const onSubmit = () => {
    props.setTransitionTarget(2);
  };
  const nameWatcher = props.form.watch('name');

  const getContinueButtonClass = useCallback(() => {
    const defaultClasses =
      'hover:bg-primary-800 transition-colors cursor-pointer';
    return !nameWatcher.length ? defaultClasses + ' disable' : defaultClasses;
  }, [nameWatcher])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={'flex items-center flex-col items-start'}
    >
      <span className={'text-nowrap mb-4 font-bold'}>
        Enter the name of your plant:{' '}
      </span>
      <TextInput
        autoComplete="off"
        {...props.form.register('name')}
        className={'mb-4'}
        value={nameWatcher}
        label={'Name'}
        required={true}
      ></TextInput>
      <Button
        type={'submit'}
        className={getContinueButtonClass()}
        variant="outline"
        size="icon"
      >
        <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
      </Button>
    </form>
  );
}
