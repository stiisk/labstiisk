const purposeInput = document.getElementById('purpose-input');
const timerDisplay = document.getElementById('timer-display');
const timeLeft = document.getElementById('time-left');
const startButton = document.getElementById('start-timer');
const resetButton = document.getElementById('reset-timer');
const activityPurpose = document.getElementById('activity-purpose');
const rainSound = document.getElementById('rain-sound');
const checklistItems = document.getElementById('checklist-items');
const completionStatus = document.getElementById('completion-status');
const purposeHelp = document.getElementById('purpose-help');
const closePopup = document.getElementById('close-popup');

let timer;
let seconds = 60 * 60; // 60 minutes
let isPaused = false;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimer() {
  if (!isPaused && seconds > 0) {
    seconds--;
    const timeString = formatTime(seconds);
    timeLeft.textContent = timeString;
    updateWindowTitle(timeString);
  } else if (seconds === 0) {
    clearInterval(timer);
    alert('Time is up!');
    rainSound.pause();
    rainSound.currentTime = 0;
    clearRaindrops();
    showFireworks();
    resetAll();
  }
}

function updateWindowTitle(timeString) {
  const purpose = activityPurpose.value.trim();
  const title = purpose ? `${purpose} - ${timeString}` : timeString;
  window.electron.send('update-title', title);
}

function createRaindrop() {
  const raindrop = document.createElement('div');
  raindrop.classList.add('raindrop');
  raindrop.style.left = `${Math.random() * 100}vw`;
  raindrop.style.animationDuration = `${Math.random() * 2 + 1}s`;
  document.body.appendChild(raindrop);
  setTimeout(() => {
    raindrop.remove();
  }, 3000);
}

function startRain() {
  rainInterval = setInterval(createRaindrop, 100);
}

function clearRaindrops() {
  clearInterval(rainInterval);
  document.querySelectorAll('.raindrop').forEach(raindrop => raindrop.remove());
}

startButton.addEventListener('click', () => {
  const purpose = activityPurpose.value.trim();
  if (purpose) {
    purposeInput.style.display = 'none';
    timerDisplay.style.display = 'block';
    timer = setInterval(updateTimer, 1000);
    rainSound.play();
    startRain();
    updateWindowTitle(formatTime(seconds));
  } else {
    alert('Please enter the purpose of the activity.');
  }
});

const pauseButton = document.getElementById('pause-timer');

pauseButton.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
  if (isPaused) {
    rainSound.pause();
    clearRaindrops();
  } else {
    rainSound.play();
    startRain();
  }
});

resetButton.addEventListener('click', () => {
  resetAll();
});

function resetAll() {
  clearInterval(timer);
  seconds = 60 * 60;
  timeLeft.textContent = formatTime(seconds);
  purposeInput.style.display = 'block';
  timerDisplay.style.display = 'none';
  activityPurpose.value = '';
  isPaused = false;
  pauseButton.textContent = 'Pause';
  rainSound.pause();
  rainSound.currentTime = 0;
  clearRaindrops();
  checklistItems.innerHTML = '<li class="list-group-item"><input type="checkbox" class="check-item" /><input type="text" class="check-text form-control d-inline-block" placeholder="New Task" style="width: 70%;" /></li>';
  completionStatus.style.display = 'none';
  document.getElementById('progress-bar').style.width = '0%';
  document.querySelectorAll('.check-item').forEach(item => {
    item.addEventListener('change', updateCompletionStatus);
  });
  document.querySelectorAll('.check-text').forEach(item => {
    item.addEventListener('input', handleChecklistInput);
    item.addEventListener('keypress', handleChecklistEnter);
  });
}

function showFireworks() {
  window.electron.send('show-fireworks');
}

purposeHelp.addEventListener('click', (event) => {
  event.preventDefault();
  alert("Think about the purpose of what you're going to do, or enter a person's name and visualize doing the task for them. The data won't be stored.");
});

closePopup.addEventListener('click', () => {
  purposePopup.style.display = 'none';
});

document.addEventListener('click', (event) => {
  if (!purposePopup.contains(event.target) && event.target !== purposeHelp) {
    purposePopup.style.display = 'none';
  }
});

if (window.electron) {
  window.electron.receive('start-timer', () => {
    startTimer();
  });
}
