'use client';
import { useRef, useEffect, useState } from 'react';
import Legend from './legend';
import Links from './Links';

/**
 * MapOverlays - Manages floating Legend and Links panels in bottom right
 * Stacks them vertically with proper spacing
 */
export default function MapOverlays() {
  const [linksOffset, setLinksOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const legendRef = useRef(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate and update Links position based on Legend height
  useEffect(() => {
    const updateLinksPosition = () => {
      if (legendRef.current) {
        const legendHeight = legendRef.current.offsetHeight;
        const gap = isMobile ? 8 : 12; // Smaller gap on mobile
        setLinksOffset(legendHeight + gap);
      }
    };

    // Initial calculation
    updateLinksPosition();

    // Recalculate on window resize
    window.addEventListener('resize', updateLinksPosition);
    
    // Use ResizeObserver if available to track Legend panel changes
    if (typeof ResizeObserver !== 'undefined' && legendRef.current) {
      const resizeObserver = new ResizeObserver(updateLinksPosition);
      resizeObserver.observe(legendRef.current);
      
      return () => {
        window.removeEventListener('resize', updateLinksPosition);
        resizeObserver.disconnect();
      };
    }

    return () => window.removeEventListener('resize', updateLinksPosition);
  }, [isMobile]);

  // Responsive positioning values
  const bottomPos = isMobile ? 10 : 20;
  const rightPos = isMobile ? 10 : 20;

  return (
    <>
      {/* Legend at bottom */}
      <div 
        ref={legendRef} 
        style={{ 
          position: 'fixed', 
          bottom: `${bottomPos}px`, 
          right: `${rightPos}px`, 
          zIndex: 1000 
        }}
      >
        <Legend floating={true} />
      </div>

      {/* Links stacked above Legend */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: `${bottomPos + linksOffset}px`, 
          right: `${rightPos}px`, 
          zIndex: 1000,
          transition: 'bottom 0.3s ease'
        }}
      >
        <Links floating={true} />
      </div>
    </>
  );
}
