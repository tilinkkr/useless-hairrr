"use client";

import React from "react";

export default function IntroVideo({ src, onEnd }: { src: string; onEnd: () => void }) {
  const [ended, setEnded] = React.useState(false);
  const [videoError, setVideoError] = React.useState(false);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleVideoEnd = () => {
    setEnded(true);
    onEnd();
  };

  const handleButtonClick = () => {
    setEnded(true);
    onEnd();
  };

  if (videoError) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur p-4">
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-600 mb-2">വീഡിയോ ലഭ്യമല്ല</p>
            <p className="text-sm text-gray-500 mb-4">ഫയൽ ഇല്ലാത്തതിനാൽ നേരിട്ട് തുടരാം</p>
            <button
              onClick={handleButtonClick}
              className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
            >
              മുടി എത്രയാണ് അറിയണോ?
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur p-4">
      <video
        src={src}
        controls
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        className="w-full rounded-lg"
      />
      {ended ? (
        <button
          onClick={handleButtonClick}
          className="mt-4 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
        >
          മുടി എത്രയാണ് അറിയണോ?
        </button>
      ) : (
        <p className="mt-3 text-sm text-black/60">വീഡിയോ പൂർണ്ണമായി കണ്ട ശേഷം ബട്ടൺ കാണിക്കും.</p>
      )}
    </div>
  );
}


