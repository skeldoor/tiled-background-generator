import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024 || // Tablet/desktop breakpoint
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      setIsMobile(isMobileDevice);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};