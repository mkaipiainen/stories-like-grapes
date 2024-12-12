import {Step, STEPS} from '@/src/stores/slices/new-plant-slice.ts';
import './new-plant-form-step-switcher.css';
import React, {Dispatch, SetStateAction} from 'react';

export function NewPlantFormStepSwitcher(props: {
  step: number,
  setTransitionTarget: Dispatch<SetStateAction<Step>>,
}) {
  function getStepClass(singleStep: number) {
    const defaultClasses =
      'rounded-full p-4 border-2 h-10 w-10 flex justify-center items-center transition-color duration-200 cursor-pointer hover:bg-primary-800 bg-primary';
    if (singleStep < props.step) {
      return defaultClasses + ' bg-success text-success-foreground';
    } else if (singleStep === props.step) {
      return defaultClasses + ' bg-primary-700';
    } else {
      return defaultClasses + ' disable';
    }
  }

  function getSeparatorClass(index: number) {
    if (index < props.step - 1) {
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
              onClick={() => props.setTransitionTarget(singleStep)}
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
