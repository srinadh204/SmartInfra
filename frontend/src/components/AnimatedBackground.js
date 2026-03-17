import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const bgImages = [
  '/images/media__1773395412684.jpg',
  '/images/media__1773395421940.jpg',
  '/images/media__1773395302653.jpg'
];

function AnimatedBackground() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
       setCurrentIdx(prev => (prev + 1) % bgImages.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, []);

  // Dark mode: heavy dark overlay. Light mode: very light white overlay so background is bright.
  const overlay = isDark
    ? 'rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)'
    : 'rgba(240, 247, 255, 0.88), rgba(248, 250, 252, 0.96)';

  return (
    <>
      {bgImages.map((src, idx) => (
        <div 
          key={src}
          style={{
             position: 'fixed',
             top: 0, left: 0, right: 0, bottom: 0,
             backgroundImage: `linear-gradient(${overlay}), url(${src})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             zIndex: -1,
             opacity: idx === currentIdx ? 1 : 0,
             transition: 'opacity 2s ease-in-out',
             pointerEvents: 'none'
          }}
        />
      ))}
    </>
  );
}

export default AnimatedBackground;
