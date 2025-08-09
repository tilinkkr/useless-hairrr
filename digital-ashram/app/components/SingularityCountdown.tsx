"use client";

import { useState, useEffect } from 'react';

// A helper function to format the time difference
const formatTimeLeft = (diff: number) => {
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { years, days, hours, minutes, seconds };
};

export default function SingularityCountdown({ years }: { years: number }) {
  const [timeLeft, setTimeLeft] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (years === Infinity) {
      setTimeLeft({ years: 999, days: 999, hours: 99, minutes: 99, seconds: 99 });
      return;
    }
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + years);

    const interval = setInterval(() => {
      const diff = targetDate.getTime() - new Date().getTime();
      if (diff > 0) {
        setTimeLeft(formatTimeLeft(diff));
      } else {
        setTimeLeft({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [years]);
  
  return (
    <div className="w-full p-4 mt-8 text-center bg-gray-800 border border-red-500 rounded-lg">
      <h3 className="text-lg font-semibold text-red-400">🚨 SCALP SINGULARITY EVENT HORIZON 🚨</h3>
      <div className="flex justify-center gap-4 mt-2 font-mono text-3xl">
        <div>{String(timeLeft.years).padStart(2, '0')} <span className="text-sm">YRS</span></div>
        <div>{String(timeLeft.days).padStart(2, '0')} <span className="text-sm">DAYS</span></div>
        <div>{String(timeLeft.hours).padStart(2, '0')} <span className="text-sm">HRS</span></div>
        <div>{String(timeLeft.minutes).padStart(2, '0')} <span className="text-sm">MIN</span></div>
        <div>{String(timeLeft.seconds).padStart(2, '0')} <span className="text-sm">SEC</span></div>
      </div>
    </div>
  );
}