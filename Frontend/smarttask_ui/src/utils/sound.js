// src/utils/sound.js
export const playNotificationSound = (type = "default") => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Different sounds for different notification types
    const sounds = {
      default: { frequency: 800, duration: 0.15, volume: 0.3 },
      task: { frequency: 1000, duration: 0.12, volume: 0.4 },
      mention: { frequency: 1200, duration: 0.2, volume: 0.35 },
      project: { frequency: 600, duration: 0.2, volume: 0.3 },
      summary: { frequency: 900, duration: 0.1, volume: 0.25 },
    };
    
    const sound = sounds[type] || sounds.default;
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = sound.frequency;
    oscillator.type = "sine";
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(sound.volume, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
    
  } catch (err) {
    // Silently fail if audio is not supported
    console.log("🔇 Audio not available");
  }
};

// Optional: Play a custom sound from a URL
export const playCustomSound = (url) => {
  try {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(() => {
      console.log("🔇 Failed to play custom sound");
    });
  } catch (err) {
    console.log("🔇 Audio not available");
  }
};