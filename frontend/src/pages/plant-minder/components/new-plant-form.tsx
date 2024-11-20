import { useCallback, useEffect, useRef, useState } from 'react';
import { NewPlantFormStep1 } from '@/pages/plant-minder/components/new-plant-form-step1.tsx';
import { NewPlantFormStep2 } from '@/pages/plant-minder/components/new-plant-form-step2.tsx';
import { useDissolve } from '@/hooks/dissolve/use-dissolve.tsx';
import { match } from 'ts-pattern';
import { NewPlantFormStepSwitcher } from '@/pages/plant-minder/components/new-plant-form-step-switcher.tsx';
import { Step } from '@store/slices/new-plant-slice.ts';
import { useAppSelector } from '@store/store.ts';
import { NewPlantFormStep3 } from '@/pages/plant-minder/components/new-plant-form-step3.tsx';

export function NewPlantForm() {
  const step1 = useRef<HTMLDivElement | null>(null);
  const step2 = useRef<HTMLDivElement | null>(null);
  const step3 = useRef<HTMLDivElement | null>(null);
  const dissolve = useDissolve();
  const step = useAppSelector((state) => state.newPlantReducer.step);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const getForm = useCallback(() => {
    return match(step)
      .with(1, () => {
        return (
          <div className={'h-full w-full flex items-center justify-center'}>
            <div
              ref={step1}
              className={' transition-opacity duration-1000 z-10'}
            >
              <NewPlantFormStep1 />
            </div>
            <div className={'opacity-0 absolute z-0'} ref={step2}>
              <NewPlantFormStep2 />
            </div>
          </div>
        );
      })
      .with(2, () => {
        return (
          <div className={'h-full w-full flex items-center justify-center'}>
            <div className={'opacity-0 absolute z-0'} ref={step1}>
              <NewPlantFormStep1 />
            </div>
            <div
              ref={step2}
              className={' transition-opacity duration-1000 z-10'}
            >
              <NewPlantFormStep2 />
            </div>
          </div>
        );
      })
      .with(3, () => {
        return (
          <div className={'h-full w-full flex items-center justify-center'}>
            <div className={'opacity-0 absolute z-0'} ref={step2}>
              <NewPlantFormStep2 />
            </div>
            <div
              ref={step3}
              className={' transition-opacity duration-1000 z-10'}
            >
              <NewPlantFormStep3 />
            </div>
          </div>
        );
      })
      .exhaustive();
  }, [step]);

  useEffect(() => {
    if (step === currentStep) {
      return;
    }
    match(step)
      .with(1, () => {
        if (step2.current) {
          step2.current.style.opacity = '1';
          dissolve({
            duration: 500,
            element: step2.current,
            removeFromFlow: true,
          }).then(() => {
            setCurrentStep(step);
          });
        }
        if (step1.current) {
          step1.current.style.opacity = '1';
        }
      })
      .with(2, () => {
        if (step1.current) {
          step1.current.style.opacity = '1';
          dissolve({
            element: step1.current,
            duration: 500,
            removeFromFlow: true,
          }).then(() => {
            setCurrentStep(step);
          });
        }
        if (step2.current) {
          step2.current.style.opacity = '1';
        }
      })
      .with(3, () => {
        if (step2.current) {
          step2.current.style.opacity = '1';
          dissolve({
            element: step2.current,
            duration: 500,
            removeFromFlow: true,
          }).then(() => {
            setCurrentStep(step);
          });
        }
        if (step3.current) {
          step3.current.style.opacity = '1';
        }
      })
      .exhaustive();
  }, [dissolve, step, currentStep]);

  return (
    <div className={'flex flex-col h-full w-full'}>
      <NewPlantFormStepSwitcher></NewPlantFormStepSwitcher>
      <div className={'flex-grow flex w-full items-center justify-center'}>
        {getForm()}
      </div>
    </div>
  );
}
