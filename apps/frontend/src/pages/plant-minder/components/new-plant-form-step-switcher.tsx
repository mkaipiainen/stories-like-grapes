import { useAppDispatch, useAppSelector } from '@/src/stores/store.ts';
import { setStep, STEPS } from '@/src/stores/slices/new-plant-slice.ts';
import './new-plant-form-step-switcher.css';
import React from 'react';

export function NewPlantFormStepSwitcher() {
  const step = useAppSelector((state) => state.newPlantReducer.step);
  const dispatch = useAppDispatch();
  function getStepClass(singleStep: number) {
    const defaultClasses =
      'rounded-full p-4 border-2 h-10 w-10 flex justify-center items-center transition-color duration-200 cursor-pointer hover:bg-primary-800 bg-primary';
    if (singleStep < step) {
      return defaultClasses + ' bg-success text-success-foreground';
    } else if (singleStep === step) {
      return defaultClasses + ' bg-primary-700';
    } else {
      return defaultClasses + ' disable';
    }
  }

  function getSeparatorClass(index: number) {
    if (index < step - 1) {
      return 'new-plant-form-separator mx-2 h-0.5 w-8 active';
    } else {
      return 'new-plant-form-separator mx-2 h-0.5 w-8';
    }
  }
  return (
    <div className={'flex items-center justify-center mt-4 mb-4'}>
      {STEPS.map((singleStep, index) => {
        return (
          <React.Fragment key={index}>
            <span
              key={singleStep}
              onClick={() => dispatch(setStep(singleStep))}
              className={getStepClass(singleStep)}
            >
              {singleStep}
            </span>
            {index !== STEPS.length - 1 && (
              <span
                key={`separator-` + index}
                className={getSeparatorClass(index)}
              ></span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
