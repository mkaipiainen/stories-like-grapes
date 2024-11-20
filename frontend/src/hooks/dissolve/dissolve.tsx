import { useEffect, useRef, useState } from 'react';

export type DissolveProps = {
  width: number;
  height: number;
  seed: number;
  duration: number;
  rootElement: HTMLElement;
  id: string;
};
export function Dissolve(props: DissolveProps) {
  const seed = useRef<number>(Math.floor(Math.random() * 1000));
  const [scale, setScale] = useState(1);
  const startTime = performance.now();
  const FADE_START = 0.3;
  const rootElement = useRef<HTMLElement>(props.rootElement);

  useEffect(() => {
    animate(performance.now());
  }, []);

  function animate(time: number) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / props.duration, 1);
    // Calculate displacement scale
    setScale((1 - Math.cos((progress * Math.PI) / 1.5)) * 300);

    // Calculate opacity
    const opacityProgress = Math.max(
      0,
      (progress - FADE_START) / (1 - FADE_START),
    );
    console.log(opacityProgress);
    rootElement.current.style.opacity = `${1 - opacityProgress}`;
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  return (
    <svg
      overflow="visible"
      style={{
        position: 'absolute',
        width: props.width,
        height: props.height,
        top: 0,
        left: 0,
      }}
      viewBox={`0 0 ${props.width} ${props.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id={props.id}
          width="400%"
          height="400%"
          x="-200%"
          y="-200%"
          colorInterpolationFilters="sRGB"
          overflow="visible"
        >
          {/*Large Noise*/}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves="1"
            seed={seed.current}
            result="bigNoise"
          />
          {/*Adjust Noise Levels*/}
          <feComponentTransfer in="bigNoise" result="bigNoiseAdjusted">
            <feFuncR type="linear" slope="2" intercept="-0.4" />
            <feFuncG type="linear" slope="2" intercept="-0.4" />
          </feComponentTransfer>
          {/*Fine Noise*/}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.99"
            numOctaves="2"
            result="fineNoise"
            seed={props.seed}
          />
          {/*Combine Noises*/}
          <feMerge result="combinedNoise">
            <feMergeNode in="bigNoiseAdjusted" />
            <feMergeNode in="fineNoise" />
          </feMerge>
          {/*Displacement Map*/}
          <feDisplacementMap
            in="SourceGraphic"
            in2="combinedNoise"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
