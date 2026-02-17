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
            const items = ref.current?.querySelectorAll('.anim-item');
            if (!items || items.length === 0) return;

            gsap.killTweensOf(items);

            gsap.set(items, { y: 20, opacity: 0 });

            const tl = gsap.timeline();
            tl.to(items, {
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
