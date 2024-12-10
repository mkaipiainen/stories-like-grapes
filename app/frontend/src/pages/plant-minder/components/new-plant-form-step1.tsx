import { ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/src/stores/store.ts';
import { setName, setStep } from '@/src/stores/slices/new-plant-slice';
import { Button, TextInput } from '@mantine/core';

type Inputs = {
  name: string;
};
export function NewPlantFormStep1() {
  const name = useAppSelector((state) => state.newPlantReducer.name);
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm<Inputs>();
  function onNameChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch(setName(event.target.value));
  }

  const onSubmit: SubmitHandler<Inputs> = () => {
    dispatch(setStep(2));
  };

  function getContinueButtonClass() {
    const defaultClasses =
      'hover:bg-primary-800 transition-colors cursor-pointer';
    return !name.length ? defaultClasses + ' disable' : defaultClasses;
  }
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
        {...register('name')}
        className={'mb-4'}
        value={name}
        label={'Name'}
        required={true}
        onChange={onNameChange}
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
