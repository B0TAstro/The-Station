import { useEffect } from 'react';
import gsap from 'gsap';

export const useAuthAnimation = (
    ref: React.RefObject<HTMLElement | null>,
    isVisible: boolean = true,
    delay: number = 0.1,
) => {
    useEffect(() => {
        if (!ref.current || !isVisible) return;

        const ctx = gsap.context(() => {
            // Kill any existing animations on these targets to prevent conflicts
            gsap.killTweensOf('.anim-item');

            // Reset state
            gsap.set('.anim-item', { y: 20, opacity: 0 });

            const tl = gsap.timeline();
            tl.to('.anim-item', {
                y: 0,
                opacity: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out',
                delay: delay,
            });
        }, ref);

        return () => ctx.revert();
    }, [isVisible, delay, ref]);
};
