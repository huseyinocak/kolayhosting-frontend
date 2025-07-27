import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils'; // cn utility fonksiyonunuz

const AnimatedListItem = ({ children, delay = 0, className }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={cn(
                "transition-all duration-500 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                className
            )}
        >
            {children}
        </div>
    );
};

export default AnimatedListItem;