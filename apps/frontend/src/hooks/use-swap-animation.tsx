import { useRef } from 'react';
import { gsap } from 'gsap';

/**
 * A hook to handle smooth animations for swapping two elements
 *
 * @param {Object} config - Configuration options for the animation
 * @param {number} config.duration - Duration of the animation in seconds
 * @param {string} config.easing - GSAP easing for the animation
 * @returns {Object} - { animateSwap, largeImageRef, thumbnailRef }
 */
const useSwapAnimation = ({
  duration = 0.5,
  easing = 'power2.inOut',
  arePropsCleared = false,
} = {}) => {
  const element1Ref = useRef<any>(null);
  const element2Ref = useRef<any>(null);

  const animateSwap = () => {
    return new Promise<void>((resolve, reject) => {
      const element1 = element1Ref.current;
      const element2 = element2Ref.current;
      if (!element1 || !element2) {
        reject();
        throw new Error('No references set, therefore could not animate');
      }

      const largeImageBox = element1.getBoundingClientRect();
      const thumbnailBox = element2.getBoundingClientRect();

      const deltaX = largeImageBox.x - thumbnailBox.x;
      const deltaY = largeImageBox.y - thumbnailBox.y;
      const scaleX = largeImageBox.width / thumbnailBox.width;
      const scaleY = largeImageBox.height / thumbnailBox.height;
      gsap.set(element1, { transformOrigin: 'top left' });
      gsap.set(element2, { transformOrigin: 'top left' });

      gsap
        .timeline({
          onComplete: () => {
            if (arePropsCleared) {
              gsap.set(element1, { clearProps: 'all' });
              gsap.set(element2, { clearProps: 'all' });
            }

            resolve();
          },
        })
        .to(element2, {
          x: deltaX,
          y: deltaY,
          scaleX,
          scaleY,
          duration,
          ease: easing,
        })
        .to(
          element1,
          {
            x: deltaX * -1,
            y: deltaY * -1,
            scaleX: 1 / scaleX,
            scaleY: 1 / scaleY,
            duration,
            ease: easing,
          },
          0, // start this animation at the same time as the previous one
        );
    });
  };
  return { animateSwap, element1Ref, element2Ref };
};

export default useSwapAnimation;
