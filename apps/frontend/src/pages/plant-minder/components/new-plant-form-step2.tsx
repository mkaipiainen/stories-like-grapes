import {useForm, UseFormReturn} from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { isNil } from 'rambda';
import { Button, NumberInput } from '@mantine/core';
import {NewPlantFormInputs} from "@/src/pages/plant-minder/components/new-plant-form.tsx";
import {Dispatch, SetStateAction, useCallback} from "react";
import {Step} from "@/src/stores/slices/new-plant-slice.ts";


export function NewPlantFormStep2(props: {
  form: UseFormReturn<NewPlantFormInputs>,
  setTransitionTarget: Dispatch<SetStateAction<Step>>;
}) {
  const { handleSubmit } = useForm();
  const wateringFrequencyWatcher = props.form.watch('wateringFrequency');

  function onSubmit() {
    props.setTransitionTarget(3);
  }

  const getContinueButtonClass = useCallback(() => {
    const defaultClasses =
      'hover:bg-primary-800 transition-colors cursor-pointer';
    return isNil(wateringFrequencyWatcher) ? defaultClasses + ' disable' : defaultClasses;
  }, [wateringFrequencyWatcher])

  function onWateringFrequencyChange(value: string | number) {
    props.form.setValue('wateringFrequency', value.toString());
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={'flex flex-col items-start'}
    >
      <span className={'mb-4 font-bold'}>
        How often should you water your plant?
      </span>
      <div className="flex mb-4 items-center">
        <span className="text-nowrap mr-4 flex items-center">Water every </span>
        <NumberInput
          className={'mr-4 flex items-center'}
          value={wateringFrequencyWatcher}
          {...props.form.register('wateringFrequency')}
          min={0}
          max={undefined}
          onChange={onWateringFrequencyChange}
          required={true}
        ></NumberInput>
        <span className={'flex items-center'}>days</span>
      </div>
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
