"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HairCounter = () => {
  const [hairCount, setHairCount] = useState(130_000_000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [message, setMessage] = useState("ഡിവൈൻ ഹെയർ കൗണ്ടർ 🧙‍♂️");
  const [showMessage, setShowMessage] = useState(false);

  const comedyMessages = [
    "ബാൾഡ് ആണോ? ചിരിക്കണ്ട! 😂",
    "നിങ്ങളുടെ തലയിൽ ഒരു ഗോൾഡൻ ഗ്ലോ ഉണ്ട്! ✨",
    "ഇത് ഒരു ക്ലീൻ ലുക്ക് ആണ്! 🎭",
    "ബാൾഡ് ആണ് ഫാഷൻ! 🎪",
    "നിങ്ങളുടെ തലയിൽ ഒരു ഗാലക്സി ഉണ്ട്! 🌌",
    "ഇത്രയും മുടി ഉള്ളത് ഒരു ഭാഗ്യം ആണ്! 🍀",
    "നിങ്ങളുടെ മുടി എണ്ണം ഒരു റെക്കോർഡ് ആണ്! 🏆",
    "ബാൾഡ് ആണ് ബ്യൂട്ടി! 💎",
    "നിങ്ങളുടെ തലയിൽ ഒരു സൂര്യൻ ഉണ്ട്! ☀️",
    "ഇത് ഒരു മാജിക് ആണ്! 🪄"
  ];

  const handleCountChange = (direction: 'add' | 'subtract') => {
    setIsCalculating(true);
    setShowMessage(false);

    // Play dramatic sound effect (if available)
    try {
      const audio = new Audio('/assets/audios/dramatic_reveal.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if audio fails
    } catch (error) {
      // Ignore audio errors
    }

    setTimeout(() => {
      // THE USELESS LOGIC: Random and chaotic counting
      const randomNumber = Math.floor(Math.random() * 5000) + 1;
      const randomSign = Math.random() > 0.5 ? 1 : -1;
      const directionModifier = Math.random() > 0.8 ? -1 : 1;
      const hugeJump = Math.random() > 0.9 ? 1_000_000 : 0;
      const baldChance = Math.random() > 0.95 ? true : false;

      let newCount;
      if (direction === 'add') {
        newCount = hairCount + (randomNumber * randomSign * directionModifier);
      } else {
        // The minus button should be even more chaotic
        newCount = hairCount - (randomNumber * randomSign * directionModifier) + hugeJump;
      }

      // Sometimes make them bald for comedy
      if (baldChance) {
        newCount = 0;
        setMessage("ബാൾഡ് ആയി! 😂");
      } else {
        // Set random comedy message
        const randomMessage = comedyMessages[Math.floor(Math.random() * comedyMessages.length)];
        setMessage(randomMessage);
      }

      setHairCount(newCount);
      setIsCalculating(false);
      setShowMessage(true);

      // Hide message after 3 seconds
      setTimeout(() => setShowMessage(false), 3000);
    }, 1500);
  };

  return (
    <motion.div 
      className="bg-ashram-background bg-opacity-50 p-6 rounded-2xl text-center shadow-2xl border border-ashram-saffron"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-2xl font-bold text-ashram-saffron mb-4 malayalam-text"
        animate={{ scale: isCalculating ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      >
        ഡിവൈൻ ഹെയർ കൗണ്ടർ 🧙‍♂️
      </motion.h3>
      
      <p className="text-sm text-ashram-text-secondary mb-2 malayalam-text">ലൈവ് സാറ്റലൈറ്റ് ഫീഡ് 📡</p>
      
      {isCalculating ? (
        <motion.div
          className="text-5xl font-mono text-ashram-accent animate-pulse"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          കണക്കാക്കുന്നു...
        </motion.div>
      ) : (
        <motion.div
          className="text-5xl font-mono text-ashram-text-primary mb-4"
          animate={{ scale: showMessage ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {hairCount === 0 ? "ബാൾഡ്! 😅" : hairCount.toLocaleString()}
        </motion.div>
      )}

      {showMessage && (
        <motion.div
          className="mb-4 p-3 bg-ashram-saffron bg-opacity-20 rounded-lg border border-ashram-saffron"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <p className="text-ashram-saffron text-sm malayalam-text">{message}</p>
        </motion.div>
      )}

      <div className="flex justify-center gap-6 mt-6">
        <motion.button 
          onClick={() => handleCountChange('add')} 
          disabled={isCalculating}
          className="bg-ashram-accent hover:bg-opacity-80 text-ashram-background font-bold p-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          disabled={isCalculating}
        >
          <span className="text-2xl">+</span>
        </motion.button>
        
        <motion.button 
          onClick={() => handleCountChange('subtract')} 
          disabled={isCalculating}
          className="bg-ashram-accent hover:bg-opacity-80 text-ashram-background font-bold p-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          disabled={isCalculating}
        >
          <span className="text-2xl">-</span>
        </motion.button>
      </div>
      
      <motion.p 
        className="text-xs text-ashram-text-secondary mt-4 malayalam-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        കൃത്യത ഗ്യാരന്റി ചെയ്യില്ല. സംഖ്യകൾ ചോദിക്കരുത്. 🤪
      </motion.p>
    </motion.div>
  );
};

export default HairCounter;


