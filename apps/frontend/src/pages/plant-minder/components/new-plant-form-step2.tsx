import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/src/stores/store.ts';
import {
  setStep,
  setWateringFrequency,
} from '@/src/stores/slices/new-plant-slice.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { isNil } from 'rambda';
import { Button, NumberInput } from '@mantine/core';

type Inputs = {
  wateringFrequency: string;
};

export function NewPlantFormStep2() {
  const dispatch = useAppDispatch();
  const wateringFrequency = useAppSelector(
    (state) => state.newPlantReducer.wateringFrequency,
  );
  const { register, handleSubmit } = useForm<Inputs>();

  function onSubmit() {
    dispatch(setStep(3));
  }
  function getContinueButtonClass() {
    const defaultClasses =
      'hover:bg-primary-800 transition-colors cursor-pointer w-full';
    return isNil(wateringFrequency)
      ? defaultClasses + ' disable'
      : defaultClasses;
  }

  function onWateringFrequencyChange(event: number | string) {
    dispatch(setWateringFrequency(event));
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
          value={wateringFrequency}
          {...register('wateringFrequency')}
          min={0}
          max={undefined}
          required={true}
          onChange={onWateringFrequencyChange}
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
