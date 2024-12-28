import { useRef } from 'react';
import gsap from 'gsap';

/**
 * A hook to handle smooth animations for swapping two elements
 *
 * @param {Object} config - Configuration options for the animation
 * @param {number} config.duration - Duration of the animation in seconds
 * @param {string} config.easing - GSAP easing for the animation
 * @returns {Object} - { animateSwap, largeImageRef, thumbnailRef }
 */
const useSwapAnimation = ({ duration = 0.5, easing = 'power2.inOut' } = {}) => {
  const element1Ref = useRef<any>();
  const element2Ref = useRef<any>();

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
      const scale = largeImageBox.width / thumbnailBox.width;

      const tl = gsap.timeline({
        onComplete: () => {
          resolve();
          gsap.set(element1, { clearProps: 'all' });
        },
      });

      tl.to(element2, {
        x: deltaX,
        y: deltaY,
        scale,
        duration,
        ease: easing,
      }).to(
        element1,
        {
          opacity: 0,
          duration: duration / 2,
        },
        0,
      );
    });
  };

  return { animateSwap, element1Ref, element2Ref };
};

export default useSwapAnimation;
