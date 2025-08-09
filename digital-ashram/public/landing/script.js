/* Globals from YouTube API */
let player = null;

/* Replace these placeholders */
const YT_VIDEO_ID = "[YOUR_YOUTUBE_VIDEO_ID]";
const NEXT_URL = "[URL_OF_YOUR_NEXT_PAGE]";

const videoWrapper = document.getElementById("video-wrapper");
const videoContainer = document.getElementById("video-container");
const playButton = document.getElementById("play-button");
const imageEl = document.getElementById("character-image");

// YouTube API calls this after script loads
function onYouTubeIframeAPIReady() {
  player = new YT.Player(videoContainer, {
    height: "100%",
    width: "100%",
    videoId: YT_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    // Mark intro as seen for middleware-based redirect control
    try {
      document.cookie = "intro=done; path=/; max-age=31536000"; // 1 year
    } catch {}
    window.location.href = NEXT_URL;
  }
}

playButton?.addEventListener("click", () => {
  // Hide CTA and image, show video frame
  playButton.style.display = "none";
  if (imageEl) imageEl.style.display = "none";
  videoWrapper.style.display = "block";

  // Start playback
  if (player && typeof player.playVideo === "function") {
    player.playVideo();
  }
});

// Make the callback visible to the YT script
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;


