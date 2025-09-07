function pad(n, width = 2) {
  return String(n).padStart(width, '0');
}

// convert milliseconds to MM:SS.mmm format
function formatMs(ms) {
  const totalMs = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;
  return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(milliseconds, 3)}`;
}

// Stopwatch card
function createStopwatchCard(container, index) {
  let running = false;
  let startTs = null;
  let elapsed = 0; // ms
  let intervalId = null;
  let laps = [];

  // DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'stopwatch-card';
  wrapper.dataset.type = 'stopwatch';

  const label = document.createElement('div');
  label.className = 'stopwatch-label';
  label.textContent = `Stopwatch #${index}`;
  wrapper.appendChild(label);

  const display = document.createElement('div');
  display.className = 'stopwatch-timer';
  display.textContent = formatMs(0);
  wrapper.appendChild(display);

  const controls = document.createElement('div');
  controls.className = 'stopwatch-controls';

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-toggle';
  startBtn.textContent = 'Start';

  const lapBtn = document.createElement('button');
  lapBtn.className = 'btn btn-reset';
  lapBtn.textContent = 'Lap';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-reset';
  resetBtn.textContent = 'Reset';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-delete';
  deleteBtn.textContent = 'Delete';

  controls.appendChild(startBtn);
  controls.appendChild(lapBtn);
  controls.appendChild(resetBtn);
  controls.appendChild(deleteBtn);
  wrapper.appendChild(controls);

  const lapsTitle = document.createElement('div');
  lapsTitle.className = 'laps-title';
  lapsTitle.textContent = 'Laps';
  lapsTitle.style.display = 'none';
  wrapper.appendChild(lapsTitle);

  // Laps list

  const lapsList = document.createElement('ul');
  lapsList.className = 'laps';
  wrapper.appendChild(lapsList);

  // stopwatch functions start/pause/reset/lap

  function updateDisplay(ms) {
    display.textContent = formatMs(ms);
  }

  function tick() {
    if (!running) return;
    const now = Date.now();
    elapsed = now - startTs;
    updateDisplay(elapsed);
  }

  function start() {
    if (running) return;
    running = true;
    startTs = Date.now() - elapsed;
    intervalId = setInterval(tick, 16);
    startBtn.textContent = 'Pause';
  }

  function pause() {
    if (!running) return;
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    startBtn.textContent = 'Start';
  }

  function reset() {
    pause();
    elapsed = 0;
    laps = [];
    lapsList.innerHTML = '';
    lapsTitle.style.display = 'none';
    updateDisplay(0);
    wrapper.classList.remove('finished');
    display.removeAttribute('data-finished-text');
  }

  function addLap() {
    laps.push(elapsed);
    renderLaps();
  }

  function renderLaps() {
    lapsList.innerHTML = '';
    if (laps.length === 0) {
      lapsTitle.style.display = 'none';
      return;
    }
    lapsTitle.style.display = 'block';
    laps.forEach((l, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}) ${formatMs(l)}`;
      lapsList.appendChild(li);
    });
  }

  // stopwatch event handlers
  startBtn.addEventListener('click', () => {
    if (running) pause();
    else start();
  });

  lapBtn.addEventListener('click', () => {
    if (!running) return; // lap only when running
    addLap();
  });

  resetBtn.addEventListener('click', reset);

  deleteBtn.addEventListener('click', () => {
    const ok = confirm('Delete this stopwatch?');
    if (!ok) return;
    if (intervalId) clearInterval(intervalId);
    wrapper.remove();
    renumberCards(container);
  });

  container.appendChild(wrapper);
  return wrapper;
}

// Timer card
function createTimerCard(container, index) {
  let running = false;
  let remaining = 0; // ms
  let endTs = null;
  let intervalId = null;

  const wrapper = document.createElement('div');
  wrapper.className = 'stopwatch-card';
  wrapper.dataset.type = 'timer';

  const label = document.createElement('div');
  label.className = 'stopwatch-label';
  label.textContent = `Timer #${index}`;
  wrapper.appendChild(label);

  const display = document.createElement('div');
  display.className = 'stopwatch-timer';
  display.textContent = formatMs(0);
  wrapper.appendChild(display);

  // Countdown input row
  const countdownRow = document.createElement('div');
  countdownRow.className = 'countdown-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'MM:SS';
  input.className = 'countdown-input';
  input.setAttribute('aria-label', 'Timer input MM:SS');

  const setBtn = document.createElement('button');
  setBtn.className = 'btn btn-reset';
  setBtn.textContent = 'Set';

  countdownRow.appendChild(input);
  countdownRow.appendChild(setBtn);
  wrapper.appendChild(countdownRow);

  const controls = document.createElement('div');
  controls.className = 'stopwatch-controls';

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-toggle';
  startBtn.textContent = 'Start';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-reset';
  resetBtn.textContent = 'Reset';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-delete';
  deleteBtn.textContent = 'Delete';

  controls.appendChild(startBtn);
  controls.appendChild(resetBtn);
  controls.appendChild(deleteBtn);
  wrapper.appendChild(controls);

  function updateDisplay(ms) {
    display.textContent = formatMs(ms);
  }

  // parse MM:SS input to milliseconds to set the timer

  function parseInputToMs(val) {
    const v = val.trim();
    if (!v) return null;
    const parts = v.split(':');
    if (parts.length !== 2) return null;
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (Number.isNaN(m) || Number.isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    return (m * 60 + s) * 1000;
  }

  function setTimerFromInput() {
    const ms = parseInputToMs(input.value);
    if (ms === null) {
      alert('Invalid format. Use MM:SS (e.g., 02:30).');
      return;
    }
    remaining = ms;
    updateDisplay(remaining);
    wrapper.classList.remove('finished');
    display.removeAttribute('data-finished-text');
  }

  // timer controls start/pause/reset

  function startTimer() {
    if (running) return;
    if (remaining <= 0) return;
    running = true;
    endTs = Date.now() + remaining;
    intervalId = setInterval(() => {
      const now = Date.now();
      remaining = Math.max(0, endTs - now);
      updateDisplay(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        running = false;
        display.textContent = '00:00.000';
        display.setAttribute('data-finished-text', "Time's up!");
        wrapper.classList.add('finished');
        startBtn.textContent = 'Start';
      }
    }, 16);
    startBtn.textContent = 'Pause';
  }

  function pauseTimer() {
    if (!running) return;
    running = false;
    clearInterval(intervalId);
    intervalId = null;
    remaining = Math.max(0, endTs - Date.now());
    startBtn.textContent = 'Start';
  }

  function resetTimer() {
    pauseTimer();
    remaining = 0;
    updateDisplay(0);
    wrapper.classList.remove('finished');
    display.removeAttribute('data-finished-text');
    input.value = '';
  }

  setBtn.addEventListener('click', setTimerFromInput);

  startBtn.addEventListener('click', () => {
    if (running) pauseTimer();
    else startTimer();
  });

  resetBtn.addEventListener('click', resetTimer);

  // delete timer confirmation

  deleteBtn.addEventListener('click', () => {
    const ok = confirm('Delete this timer?');
    if (!ok) return;
    if (intervalId) clearInterval(intervalId);
    wrapper.remove();
    renumberCards(container);
  });

  container.appendChild(wrapper);
  return wrapper;
}

// re-label cards after one is deleted

function renumberCards(container) {
  const cards = container.querySelectorAll('.stopwatch-card');
  let stopwatchCount = 0;
  let timerCount = 0;
  cards.forEach((card) => {
    const lbl = card.querySelector('.stopwatch-label');
    if (!lbl) return;
    if (card.dataset.type === 'timer') {
      timerCount++;
      lbl.textContent = `Timer #${timerCount}`;
    } else {
      stopwatchCount++;
      lbl.textContent = `Stopwatch #${stopwatchCount}`;
    }
  });
}

// app bootstrap

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app'); // main container
  const addBtn = document.getElementById('add'); // add button
  const typeSelect = document.getElementById('type-select'); // type selector

  // add new card after selection
  function addCard() {
    const type = typeSelect.value;
    const currentCount = app.querySelectorAll('.stopwatch-card').length;
    const nextIndex = currentCount + 1;
    if (type === 'timer') {
      createTimerCard(app, nextIndex);
    } else {
      createStopwatchCard(app, nextIndex);
    }
  }

  addBtn.addEventListener('click', addCard);

  // create one default stopwatch
  createStopwatchCard(app, 1);
});
