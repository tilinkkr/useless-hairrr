"use client";

import { useState } from 'react';

export default function HairSonificationPlayer({ count, vibrancy }: { count: number, vibrancy: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const handlePlay = () => {
    if (isPlaying) {
      audioContext?.close();
      setIsPlaying(false);
      return;
    }

    const Ctor: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    const context: AudioContext = new Ctor();
    setAudioContext(context);
    setIsPlaying(true);

    // Map data to sound parameters
    // Higher count = higher base frequency (pitch)
    const baseFreq = 200 + (Math.min(count, 150000) / 150000) * 400;
    // Higher vibrancy = more dramatic filter effect
    const numericVibrancy = parseFloat(String(vibrancy).replace(/[^0-9.]/g, '')) || 0;
    const filterFreq = 500 + (numericVibrancy / 100) * 2000;

    // Create the sound nodes
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = baseFreq;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, context.currentTime);

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, context.currentTime);

    // Create a simple arpeggio
    const notes = [0, 4, 7, 12]; // Intervals for a major chord + octave
    notes.forEach((note, i) => {
      const t = context.currentTime + i * 0.2;
      oscillator.frequency.setValueAtTime(baseFreq * Math.pow(2, note / 12), t);
      gainNode.gain.linearRampToValueAtTime(0.2, t + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, t + 0.18);
    });

    oscillator.connect(filter).connect(gainNode).connect(context.destination);
    oscillator.start();
  };
  
  return (
    <div className="w-full text-center mt-8">
      <button
        onClick={handlePlay}
        className="px-6 py-3 bg-teal-600 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors"
      >
        {isPlaying ? '⏹️ Silence My Follicles' : '🎶 Play My Hair Anthem'}
      </button>
    </div>
  );
}