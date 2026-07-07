'use client';

import { useEffect, useState } from 'react';

type Slide = { heading: string; sub: string };

const INTERVAL = 4500;
const FADE_DURATION = 500;

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        setVisible(true);
      }, FADE_DURATION);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <div
      className="transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <h1 className="font-display mb-6 text-6xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
        {slide.heading}
      </h1>
      <p className="mb-10 text-xl text-white/55">{slide.sub}</p>
    </div>
  );
}
