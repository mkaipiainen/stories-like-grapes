import { useCallback, useEffect, useRef, useState } from 'react';
import { NewPlantFormStep1 } from '@/src/pages/plant-minder/components/new-plant-form-step1.tsx';
import { NewPlantFormStep2 } from '@/src/pages/plant-minder/components/new-plant-form-step2.tsx';
import { useDissolve } from '@/src/hooks/dissolve/use-dissolve.tsx';
import { match } from 'ts-pattern';
import { NewPlantFormStepSwitcher } from '@/src/pages/plant-minder/components/new-plant-form-step-switcher.tsx';
import { NewPlantFormStep3 } from '@/src/pages/plant-minder/components/new-plant-form-step3.tsx';
import { NewPlantFormStep4 } from './new-plant-form-step4';
import { useForm } from 'react-hook-form';
import { FileWithPath } from '@mantine/dropzone';

export const STEPS: Step[] = [1, 2, 3, 4];
export type Step = 1 | 2 | 3 | 4;
export type NewPlantFormInputs = {
  name: string;
  description: string;
  wateringFrequency: string;
  tags: string[];
  image: FileWithPath | undefined;
};

export function NewPlantForm() {
  const step1 = useRef<HTMLDivElement | null>(null);
  const step2 = useRef<HTMLDivElement | null>(null);
  const step3 = useRef<HTMLDivElement | null>(null);
  const step4 = useRef<HTMLDivElement | null>(null);
  const dissolve = useDissolve();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [transitionTarget, setTransitionTarget] = useState<Step>(1);
  const form = useForm<NewPlantFormInputs>({
    defaultValues: {
      description: '',
      name: '',
      tags: [],
      image: undefined,
      wateringFrequency: '0',
    },
  });

  const getForm = useCallback(() => {
    return match(transitionTarget)
      .with(1, () => {
        return (
          <div className={'h-full w-full flex items-center justify-center'}>
            <div className={'opacity-0 absolute z-0'} ref={step2}>
              <NewPlantFormStep2
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
            <div ref={step1} className={'z-10 step1'}>
              <NewPlantFormStep1
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
          </div>
        );
      })
      .with(2, () => {
        return (
          <div className={'h-full w-full flex items-center justify-center'}>
            <div className={'opacity-0 absolute z-0'} ref={step1}>
              <NewPlantFormStep1
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
            <div ref={step2} className={'z-10 step2'}>
              <NewPlantFormStep2
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
          </div>
        );
      })
      .with(3, () => {
        return (
          <div className={'h-full w-full flex items-center justify-center'}>
            <div className={'opacity-0 absolute z-0'} ref={step2}>
              <NewPlantFormStep2
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
            <div ref={step3} className={'z-10 step3'}>
              <NewPlantFormStep3
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
          </div>
        );
      })
      .with(4, () => {
        return (
          <div className={'h-full w-full flex items-center justify-center'}>
            <div className={'opacity-0 absolute z-0'} ref={step2}>
              <NewPlantFormStep3
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
            <div ref={step4} className={'z-10 step3'}>
              <NewPlantFormStep4
                setTransitionTarget={setTransitionTarget}
                form={form}
              />
            </div>
          </div>
        );
      })
      .exhaustive();
  }, [transitionTarget]);

  useEffect(() => {
    if (transitionTarget === currentStep) {
      return;
    }
    const targetRef = match(transitionTarget)
      .with(1, () => step1)
      .with(2, () => step2)
      .with(3, () => step3)
      .with(4, () => step4)
      .exhaustive();
    const sourceRef = match(currentStep)
      .with(1, () => step1)
      .with(2, () => step2)
      .with(3, () => step3)
      .with(4, () => step4)
      .exhaustive();
    const DURATION = 1000;

    if (targetRef.current) {
      targetRef.current.style.opacity = '0';
      setTimeout(() => {
        if (targetRef.current) {
          targetRef.current.style.transition = `opacity ${DURATION * 1.5}ms`;
          targetRef.current.style.opacity = '1';

          setTimeout(() => {
            if (targetRef.current) {
              targetRef.current.style.transition = '';
            }
          }, DURATION * 1.5);
        }
      });
    }
    if (sourceRef.current) {
      sourceRef.current.style.opacity = '1';
      const targetColorMatrix =
        currentStep === 3
          ? {
              r: [0, 0, 0, 0, 0],
              g: [1, 1, 1, 1, 1],
              b: [0, 0, 0, 0, 0],
              a: [0, 0, 0, 1, 0],
            }
          : undefined;
      dissolve({
        duration: DURATION,
        element: sourceRef.current,
        removeFromFlow: true,
        targetColorMatrix: targetColorMatrix,
      }).then(() => {
        setCurrentStep(transitionTarget);
      });
    }
  }, [dissolve, transitionTarget, currentStep]);

  return (
    <div className={'flex flex-col h-full w-full'}>
      <NewPlantFormStepSwitcher
        step={transitionTarget}
        setTransitionTarget={setTransitionTarget}
      ></NewPlantFormStepSwitcher>
      <div className={'flex-grow flex w-full items-center justify-center'}>
        {getForm()}
      </div>
    </div>
  );
}
