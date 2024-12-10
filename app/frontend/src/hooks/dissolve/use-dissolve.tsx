import { GUID } from '@/src/util/guid.ts';
import { createRoot } from 'react-dom/client';
import { Dissolve } from '@/src/hooks/dissolve/dissolve.tsx';
export type ColorMatrix = {
  r: number[];
  g: number[];
  b: number[];
  a: number[];
}

export function useDissolve() {
  const dissolves = new Map<string, HTMLElement>();

  function dissolve(options: {
    element: HTMLElement;
    duration?: number;
    removeFromFlow?: boolean;
    targetColorMatrix?: ColorMatrix;
  }) {
    if (dissolves.has(options.element.id)) {
      return new Promise<void>((resolve) => {
        resolve();
      });
    }
    return new Promise<void>((resolve) => {
      dissolves.set(options.element.id, options.element);
      const duration = options.duration ?? 500;
      const id = GUID();
      const boundingBox = options.element.getBoundingClientRect();
      const anchor = document.createElement('div');
      anchor.style.position = 'absolute';
      anchor.style.left = '0';
      anchor.style.top = '0';
      anchor.style.height = `${boundingBox.height}px`;
      anchor.style.width = `${boundingBox.width}px`;
      options.element.appendChild(anchor);

      if (options.removeFromFlow) {
        options.element.style.position = 'fixed';
        options.element.style.left = `${boundingBox.left}px`;
        options.element.style.top = `${boundingBox.top}px`;
      }
      const root = createRoot(anchor);
      root.render(
        <Dissolve
          width={boundingBox.width}
          height={boundingBox.height}
          seed={Math.random() * 10000}
          targetColorMatrix={options.targetColorMatrix}
          duration={duration}
          rootElement={options.element}
          id={id}
        />,
      );
      options.element.style.filter = `url(#${id})`;

      // Cleanup after duration
      setTimeout(() => {
        root.unmount(); // Unmount the React root
        options.element.removeChild(anchor); // Remove the anchor element
        options.element.style.filter = ''; // Reset the filter
        if (options.removeFromFlow) {
          options.element.style.position = '';
          options.element.style.left = '';
          options.element.style.top = '';
        }
        dissolves.delete(options.element.id);
        resolve();
      }, duration);
    });
  }

  return dissolve;
}
