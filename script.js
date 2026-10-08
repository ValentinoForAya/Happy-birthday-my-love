/* ============================
   ROMANTIC PAGE — SCRIPT.JS
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── PARTICLES ─────────────────────────────── */
  const particlesContainer = document.querySelector('.particles-container');
  const PARTICLE_COUNT = 28;

  function createParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    const left = Math.random() * 100;
    const dur  = Math.random() * 14 + 10;
    const del  = Math.random() * 20;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%;
      bottom:-10px;
      animation-duration:${dur}s;
      animation-delay:${del}s;
      opacity:0;
    `;
    particlesContainer.appendChild(p);
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) createParticle();

  /* ── FLOATING MUSIC / HEARTS ───────────────── */
  const floatersContainer = document.querySelector('.floaters-container');
  const FLOATER_SYMBOLS = ['♪', '♫', '♬', '♩', '♥', '✦', '✧', '❋', '♡'];
  const FLOATER_COUNT = 18;

  function createFloater() {
    const f = document.createElement('div');
    f.className = 'floater';
    const sym  = FLOATER_SYMBOLS[Math.floor(Math.random() * FLOATER_SYMBOLS.length)];
    const left = Math.random() * 95;
    const size = Math.random() * 10 + 12;
    const dur  = Math.random() * 18 + 14;
    const del  = Math.random() * 30;
    const drift= (Math.random() - 0.5) * 80;
    const rot  = (Math.random() - 0.5) * 180;
    f.textContent = sym;
    f.style.cssText = `
      left:${left}%;
      bottom:-30px;
      font-size:${size}px;
      animation-duration:${dur}s;
      animation-delay:${del}s;
      --drift:${drift}px;
      --rot:${rot}deg;
    `;
    floatersContainer.appendChild(f);
  }

  for (let i = 0; i < FLOATER_COUNT; i++) createFloater();

  /* ── SPARKLES ──────────────────────────────── */
  function spawnSparkle() {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const size = Math.random() * 6 + 3;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}vh;
      left:${Math.random() * 100}vw;
      animation-delay:${Math.random() * 2}s;
      animation-duration:${Math.random() * 2 + 2}s;
    `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 5000);
  }

  setInterval(spawnSparkle, 1200);

  /* ── WAVE BARS ─────────────────────────────── */
  const wavePeaks = [10, 18, 24, 20, 14, 22, 16, 20, 12, 24, 18, 10, 22, 16, 14];
  const waveBars = document.querySelectorAll('.wave-bar');
  const waveSpeeds = ['0.6s','0.8s','0.5s','0.9s','0.7s','1.0s','0.6s','0.8s','0.5s','0.9s','0.7s','0.6s','0.8s','0.5s','0.9s'];

  waveBars.forEach((bar, i) => {
    bar.style.setProperty('--peak', `${wavePeaks[i] || 14}px`);
    bar.style.setProperty('--delay', waveSpeeds[i] || '0.7s');
  });

  /* ── AUDIO SETUP ───────────────────────────── */
  const audio = new Audio('22.mp3');
  audio.loop  = false;
  audio.preload = 'metadata';

  let isPlaying   = false;
  let isShuffle   = false;
  let isRepeat    = false;
  let isDragging  = false;

  const playBtn      = document.getElementById('play-btn');
  const prevBtn      = document.getElementById('prev-btn');
  const nextBtn      = document.getElementById('next-btn');
  const shuffleBtn   = document.getElementById('shuffle-btn');
  const repeatBtn    = document.getElementById('repeat-btn');
  const progressBar  = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const currentTime  = document.getElementById('current-time');
  const totalTime    = document.getElementById('total-time');
  const volumeSlider = document.getElementById('volume-slider');
  const autoplayHint = document.getElementById('autoplay-hint');
  const vinylDisc    = document.querySelector('.vinyl-disc');

  /* Format seconds → mm:ss */
  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  /* Update play/pause icon */
  function setPlayIcon(playing) {
    const icon = document.getElementById('play-icon');
    if (playing) {
      icon.innerHTML = `
        <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
      `;
      playBtn.classList.add('playing');
      vinylDisc.classList.add('spinning');
      setWavesAnimated(true);
    } else {
      icon.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      `;
      playBtn.classList.remove('playing');
      vinylDisc.classList.remove('spinning');
      setWavesAnimated(false);
    }
  }

  function setWavesAnimated(on) {
    waveBars.forEach(bar => {
      if (on) bar.classList.add('animated');
      else    bar.classList.remove('animated');
    });
  }

  function hideHint() {
    if (autoplayHint) {
      autoplayHint.classList.add('hidden');
    }
  }

  async function playAudio() {
    try {
      await audio.play();
      isPlaying = true;
      setPlayIcon(true);
      hideHint();
    } catch(e) {
      isPlaying = false;
      setPlayIcon(false);
    }
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    setPlayIcon(false);
  }

  function togglePlay() {
    if (isPlaying) pauseAudio();
    else           playAudio();
  }

  /* Progress update */
  audio.addEventListener('timeupdate', () => {
    if (isDragging) return;
    const dur  = audio.duration || 0;
    const cur  = audio.currentTime || 0;
    const pct  = dur > 0 ? (cur / dur) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    currentTime.textContent  = fmt(cur);
    if (dur && !isNaN(dur)) totalTime.textContent = fmt(dur);
    highlightCurrentLyric(cur);
  });

  audio.addEventListener('loadedmetadata', () => {
    totalTime.textContent = fmt(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (isRepeat) {
      audio.currentTime = 0;
      playAudio();
    } else {
      isPlaying = false;
      setPlayIcon(false);
      progressFill.style.width = '0%';
      currentTime.textContent  = '0:00';
      audio.currentTime = 0;
    }
  });

  /* Progress bar click & drag */
  function seekTo(e) {
    const rect = progressBar.getBoundingClientRect();
    const x    = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct  = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = pct * (audio.duration || 0);
    progressFill.style.width = `${pct * 100}%`;
  }

  progressBar.addEventListener('mousedown',  (e) => { isDragging = true; seekTo(e); });
  progressBar.addEventListener('touchstart', (e) => { isDragging = true; seekTo(e); }, { passive: true });
  document.addEventListener('mousemove',  (e) => { if (isDragging) seekTo(e); });
  document.addEventListener('touchmove',  (e) => { if (isDragging) seekTo(e); }, { passive: true });
  document.addEventListener('mouseup',  () => { isDragging = false; });
  document.addEventListener('touchend', () => { isDragging = false; });

  /* Buttons */
  playBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    if (isPlaying) playAudio();
  });

  nextBtn.addEventListener('click', () => {
    audio.currentTime = audio.duration ? audio.duration - 0.1 : 0;
  });

  shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
  });

  repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
    audio.loop = isRepeat;
  });

  /* Volume */
  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
  });

  /* Autoplay attempt */
  setTimeout(() => {
    playAudio();
  }, 600);

  /* First user interaction fallback */
  const firstInteraction = () => {
    if (!isPlaying) playAudio();
    document.removeEventListener('click',      firstInteraction);
    document.removeEventListener('touchstart', firstInteraction);
    document.removeEventListener('keydown',    firstInteraction);
  };

  document.addEventListener('click',      firstInteraction);
  document.addEventListener('touchstart', firstInteraction, { passive: true });
  document.addEventListener('keydown',    firstInteraction);

  /* ── LYRICS HIGHLIGHT ──────────────────────── */
  // Times in seconds where each stanza starts
  const lyricTimings = [
    { id: 'stanza-1', time: 0    },
    { id: 'stanza-2', time: 23   },
    { id: 'stanza-3', time: 45   },
    { id: 'stanza-4', time: 65   },
    { id: 'stanza-5', time: 88   },
    { id: 'stanza-6', time: 108  },
    { id: 'stanza-7', time: 128  },
    { id: 'stanza-8', time: 148  },
    { id: 'stanza-9', time: 168  },
    { id: 'stanza-10', time: 190 },
  ];

  let currentStanzaId = null;

  function highlightCurrentLyric(time) {
    let activeId = null;
    for (let i = lyricTimings.length - 1; i >= 0; i--) {
      if (time >= lyricTimings[i].time) {
        activeId = lyricTimings[i].id;
        break;
      }
    }
    if (activeId !== currentStanzaId) {
      if (currentStanzaId) {
        const prev = document.getElementById(currentStanzaId);
        if (prev) prev.classList.remove('active-lyric');
      }
      if (activeId) {
        const el = document.getElementById(activeId);
        if (el) {
          el.classList.add('active-lyric');
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      currentStanzaId = activeId;
    }
  }

  /* ── POLAROID PARALLAX (light tilt on device motion) ── */
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      const tiltX = (e.gamma || 0) / 30; // -1 to 1
      const tiltY = (e.beta  || 0) / 30;

      const p1 = document.querySelector('.polaroid-wrap:first-child');
      const p2 = document.querySelector('.polaroid-wrap:last-child');

      if (p1) p1.style.transform = `rotate(${-5 + tiltX * 2}deg) translateY(${10 - tiltY * 4}px)`;
      if (p2) p2.style.transform = `rotate(${5  + tiltX * 2}deg) translateY(${0  - tiltY * 4}px)`;
    }, { passive: true });
  }

  /* ── MOUSE PARALLAX (desktop) ──────────────── */
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 to 1
    const dy = (e.clientY - cy) / cy;

    const p1 = document.querySelector('.polaroid-wrap:first-child');
    const p2 = document.querySelector('.polaroid-wrap:last-child');

    if (p1) p1.style.transform = `rotate(${-5 + dx * 2}deg) translateY(${10 + dy * 6}px)`;
    if (p2) p2.style.transform = `rotate(${5  + dx * 2}deg) translateY(${0  + dy * 6}px)`;
  });

/* --- INICIO DEL CÓDIGO A PEGAR --- */
  const playlist = ['22.mp3', '23.mp3'];
  let currentTrackIdx = 0;

  // Se aplica !important a través de JS para asegurar la interacción de los botones
  nextBtn.style.setProperty('pointer-events', 'auto', 'important');
  prevBtn.style.setProperty('pointer-events', 'auto', 'important');

  function loadTrack(idx) {
    const wasPlaying = isPlaying;
    audio.src = playlist[idx];
    audio.load();
    if (wasPlaying) playAudio();
  }

  // El 'true' al final del listener asegura que este evento se ejecute antes que los originales
  nextBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (isShuffle) {
      currentTrackIdx = Math.floor(Math.random() * playlist.length);
    } else {
      currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
    }
    loadTrack(currentTrackIdx);
  }, true);

  prevBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIdx);
  }, true);

  audio.addEventListener('ended', (e) => {
    if (!isRepeat) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      if (isShuffle) {
        currentTrackIdx = Math.floor(Math.random() * playlist.length);
      } else {
        currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
      }
      loadTrack(currentTrackIdx);
      playAudio();
    }
  }, true);
  /* --- FIN DEL CÓDIGO A PEGAR --- */
});
