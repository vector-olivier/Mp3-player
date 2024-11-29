const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const playPauseButton = document.getElementById('play-pause');
const currentTrack = document.getElementById('current-track');

let audio = new Audio();
let audioSource;
let analyser;

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    audio.src = objectURL;
    currentTrack.textContent = file.name;
    setupAudio();
  }
});

playPauseButton.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseButton.textContent = '⏸️';
  } else {
    audio.pause();
    playPauseButton.textContent = '▶️';
  }
});

function setupAudio() {
  if (audioSource) {
    audioSource.disconnect();
  }
  audioSource = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();
  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 256;

  visualize();
}

function visualize() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
      canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
      x += barWidth + 1;
    }

    requestAnimationFrame(draw);
  }

  draw();
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = 300;
});

canvas.width = window.innerWidth;
canvas.height = 300;
