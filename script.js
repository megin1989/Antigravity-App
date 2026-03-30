const WORK_MINUTES = 25;
let remainingSeconds = WORK_MINUTES * 60;
let timerId = null;
let isRunning = false;

// DOM Elements
const displayEl = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

/**
 * Formats seconds into MM:SS string
 * @param {number} totalSeconds 
 * @returns {string} Formatted time string
 */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Updates DOM and Document Title with formatted time
 */
function updateDisplay() {
  const timeStr = formatTime(remainingSeconds);
  displayEl.textContent = timeStr;
  document.title = isRunning ? `${timeStr} - Focus` : 'Pomodoro Timer';
}

/**
 * Generates an elegant chime sequence using Web Audio API
 * Requires no external audio files!
 */
function playNotificationSound() {
  // Use a fallback to AudioContext
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const audioCtx = new AudioContext();
  
  const playTone = (frequency, type, startTimeOffset, duration) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTimeOffset);
    
    // Envelope for a softer "bell" percussive sound
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTimeOffset);
    gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + startTimeOffset + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTimeOffset + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(audioCtx.currentTime + startTimeOffset);
    oscillator.stop(audioCtx.currentTime + startTimeOffset + duration);
  };

  // Play a pleasant C-Major 7th arpeggio (C, E, G, B)
  playTone(523.25, 'sine', 0, 1.5);     // C5
  playTone(659.25, 'sine', 0.15, 1.5);  // E5
  playTone(783.99, 'sine', 0.3, 1.5);   // G5
  playTone(987.77, 'sine', 0.45, 2.5);  // B5
}

/**
 * Handles Start/Pause logic
 */
function toggleTimer() {
  if (isRunning) {
    // Pause
    clearInterval(timerId);
    isRunning = false;
    startBtn.textContent = 'Start';
    startBtn.classList.remove('running');
    startBtn.setAttribute('aria-label', 'Start Timer');
  } else {
    // Prevent starting if already at 0 without reset
    if (remainingSeconds === 0) {
      resetTimer();
      return; 
    }
    
    // Start
    isRunning = true;
    startBtn.textContent = 'Pause';
    startBtn.classList.add('running');
    startBtn.setAttribute('aria-label', 'Pause Timer');
    
    timerId = setInterval(() => {
      remainingSeconds--;
      updateDisplay();
      
      if (remainingSeconds <= 0) {
        clearInterval(timerId);
        isRunning = false;
        startBtn.textContent = 'Start';
        startBtn.classList.remove('running');
        startBtn.setAttribute('aria-label', 'Start Timer');
        playNotificationSound();
      }
    }, 1000);
  }
  updateDisplay();
}

/**
 * Resets the timer back to 25 minutes
 */
function resetTimer() {
  if (timerId) {
    clearInterval(timerId);
  }
  isRunning = false;
  remainingSeconds = WORK_MINUTES * 60;
  startBtn.textContent = 'Start';
  startBtn.classList.remove('running');
  startBtn.setAttribute('aria-label', 'Start Timer');
  updateDisplay();
}

// Event Listeners
startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial UI Setup
updateDisplay();
