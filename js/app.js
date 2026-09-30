// Set this to the password you share with her before publishing the page.
// This is a playful gate only: a static site cannot keep a password secret.
const LETTER_PASSWORD = '143'; //10262000

const passwordForm = document.querySelector('#password-form');
const passwordInput = document.querySelector('#letter-password');
const passwordError = document.querySelector('#password-error');
const sessionStatus = document.querySelector('#session-status');
const themeToggle = document.querySelector('#theme-toggle');
const heartDraw = document.querySelector('#heart-draw');
const coupleReveal = document.querySelector('#couple-reveal');
const coupleRevealImage = document.querySelector('#couple-reveal-image');
const envelopeStage = document.querySelector('#envelope-stage');
const letterDialog = document.querySelector('#letter-dialog');
const letterDialogTitle = document.querySelector('#letter-dialog-title');
const letterDialogClose = document.querySelector('#letter-dialog-close');
const envelopeButtons = [...document.querySelectorAll('.envelope-button')];
const memoryPop = document.querySelector('#memory-pop');
const memoryImage = document.querySelector('#memory-image');
const memoryCaption = document.querySelector('#memory-caption');
const memoryEmpty = document.querySelector('#memory-empty');
const memoryClose = document.querySelector('#memory-close');
const birthdayPhotos = [
  'images/birthday/1.jpg', 'images/birthday/2.jpg', 'images/birthday/3.jpg',
  'images/birthday/4.jpg', 'images/birthday/5.jpg', 'images/birthday/6.jpg',
  'images/birthday/7.jpg', 'images/birthday/8.jpeg', 'images/birthday/9.jpg',
  'images/birthday/10.jpg', 'images/birthday/11.jpg', 'images/birthday/12.jpeg'
];
const couplePhotos = [
  'images/monthsary/1.jpg', 'images/monthsary/2.jpg', 'images/monthsary/3.jpg',
  'images/monthsary/4.jpg', 'images/monthsary/5.jpg', 'images/monthsary/6.jpg',
  'images/monthsary/7.jpg', 'images/monthsary/8.jpg', 'images/monthsary/9.jpg',
  'images/monthsary/10.jpg', 'images/monthsary/11.jpg', 'images/monthsary/12.jpg',
  'images/monthsary/13.jpg', 'images/monthsary/14.jpg', 'images/monthsary/15.jpg',
  'images/monthsary/16.jpg', 'images/monthsary/17.jpg', 'images/monthsary/18.jpg',
  'images/monthsary/19.jpg', 'images/monthsary/20.jpeg', 'images/monthsary/21.jpeg'
];
const birthdaySlideA = document.querySelector('#birthday-slide-a');
const birthdaySlideB = document.querySelector('#birthday-slide-b');
const birthdaySlideCount = document.querySelector('#birthday-slide-count');
const birthdayCaptions = [
  'Pare ko, Your smile makes every moment brighter.',
  'One of my favorite memories with Fibi ko.',
  'A little moment I want to keep forever, Mahal ko.',
  'My favorite person (fibi), in a favorite moment.',
  'You make ordinary days feel magical.',
  'You are my favorite gift.',
  'Your happiness is my favorite thing to look at',
  'My Answered Prayer.'

];
let memoryHideTimer;
let memoryRemoveTimer;
let birthdayPhotoLast = '';
let birthdayCaptionLast = '';
let birthdaySlideIndex = 0;
let birthdayActiveSlide = birthdaySlideA;
let birthdaySlideshowTimer = null;
const SESSION_IDLE_LIMIT = 3 * 60 * 1000;
let sessionUnlocked = false;
let sessionIdleTimer = null;
let heartIntroTimer = null;
let lastPointerActivity = 0;

function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.textContent = dark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeToggle.setAttribute('aria-pressed', String(dark));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#170b0d' : '#fff7f4');
  try { localStorage.setItem('birthday-theme', dark ? 'dark' : 'light'); } catch { /* Theme still works when storage is unavailable. */ }
}

let savedTheme = 'light';
try { savedTheme = localStorage.getItem('birthday-theme') === 'dark' ? 'dark' : 'light'; } catch { /* Use light mode when storage is unavailable. */ }
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

function resetSessionIdleTimer() {
  if (!sessionUnlocked) return;
  window.clearTimeout(sessionIdleTimer);
  sessionIdleTimer = window.setTimeout(lockSession, SESSION_IDLE_LIMIT);
}

function lockSession() {
  if (!sessionUnlocked) return;
  sessionUnlocked = false;
  window.clearTimeout(sessionIdleTimer);
  window.clearTimeout(heartIntroTimer);
  heartDraw.hidden = true;
  heartDraw.classList.remove('is-playing');
  coupleReveal.hidden = true;
  coupleReveal.classList.remove('is-visible');
  coupleRevealImage.removeAttribute('href');
  if (letterDialog.open) letterDialog.close();
  stopBirthdaySlideshow();
  if (memoryPop) {
    window.clearTimeout(memoryHideTimer);
    window.clearTimeout(memoryRemoveTimer);
    memoryPop.classList.remove('show');
    memoryPop.hidden = true;
  }
  envelopeButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove('open');
  });
  activeEnvelope = null;
  envelopeStage.hidden = true;
  passwordForm.hidden = false;
  passwordInput.value = '';
  passwordError.textContent = '';
  sessionStatus.textContent = 'You were logged out after 3 minutes without activity. Enter the password to unlock again.';
  sessionStatus.hidden = false;
  passwordForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  passwordInput.focus({ preventScroll: true });
}

['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((eventName) => {
  document.addEventListener(eventName, resetSessionIdleTimer, { capture: true, passive: true });
});
document.addEventListener('pointermove', () => {
  const now = Date.now();
  if (now - lastPointerActivity < 15000) return;
  lastPointerActivity = now;
  resetSessionIdleTimer();
}, { passive: true });

document.querySelectorAll('.heart-bubble').forEach((bubble) => {
  bubble.addEventListener('click', () => {
    memoryImage.hidden = false;
    memoryEmpty.hidden = true;
    memoryCaption.hidden = false;

    let photo = birthdayPhotos[Math.floor(Math.random() * birthdayPhotos.length)];
    if (birthdayPhotos.length > 1 && photo === birthdayPhotoLast) {
      photo = birthdayPhotos[(birthdayPhotos.indexOf(photo) + 1 + Math.floor(Math.random() * (birthdayPhotos.length - 1))) % birthdayPhotos.length];
    }
    birthdayPhotoLast = photo;
    let caption = birthdayCaptions[Math.floor(Math.random() * birthdayCaptions.length)];
    if (birthdayCaptions.length > 1 && caption === birthdayCaptionLast) {
      caption = birthdayCaptions[(birthdayCaptions.indexOf(caption) + 1 + Math.floor(Math.random() * (birthdayCaptions.length - 1))) % birthdayCaptions.length];
    }
    birthdayCaptionLast = caption;
    memoryImage.src = photo;
    memoryImage.alt = 'A birthday photo memory';
    memoryCaption.textContent = caption;

    window.clearTimeout(memoryHideTimer);
    window.clearTimeout(memoryRemoveTimer);
    memoryPop.hidden = false;
    memoryPop.classList.remove('show');
    requestAnimationFrame(() => memoryPop.classList.add('show'));
    memoryHideTimer = window.setTimeout(() => {
      memoryPop.classList.remove('show');
      memoryRemoveTimer = window.setTimeout(() => { memoryPop.hidden = true; }, 280);
    }, 2500);
  });
});

memoryImage.addEventListener('error', () => {
  memoryImage.hidden = true;
  memoryEmpty.hidden = false;
  memoryCaption.hidden = true;
  memoryEmpty.textContent = 'This photo could not be loaded. Check the images/birthday folder.';
});

function closeMemoryPop() {
  window.clearTimeout(memoryHideTimer);
  window.clearTimeout(memoryRemoveTimer);
  memoryPop.classList.remove('show');
  memoryRemoveTimer = window.setTimeout(() => { memoryPop.hidden = true; }, 280);
}

memoryClose.addEventListener('click', closeMemoryPop);
memoryPop.addEventListener('click', (event) => {
  if (event.target === memoryPop) closeMemoryPop();
});

passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (passwordInput.value.trim().toLowerCase() !== LETTER_PASSWORD.toLowerCase()) {
    passwordError.textContent = 'That password isn’t quite right. Clue "Mahal kita"';
    passwordInput.select();
    return;
  }

  passwordError.textContent = '';
  sessionStatus.hidden = true;
  passwordForm.hidden = true;
  envelopeStage.hidden = true;
  envelopeStage.classList.remove('is-revealed');
  coupleReveal.hidden = true;
  coupleReveal.classList.remove('is-visible');
  heartDraw.hidden = false;
  heartDraw.classList.remove('is-playing');
  void heartDraw.offsetWidth;
  heartDraw.classList.add('is-playing');
  sessionUnlocked = true;
  resetSessionIdleTimer();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealDelay = reducedMotion ? 0 : 3000; 
  heartIntroTimer = window.setTimeout(() => {
    if (!sessionUnlocked) return;
    heartDraw.hidden = true;
    heartDraw.classList.remove('is-playing');
    const photoIndex = Math.floor(Math.random() * couplePhotos.length);
    coupleRevealImage.setAttribute('href', couplePhotos[photoIndex]);
    document.querySelector('#couple-photo-title').textContent = `A favorite photo of us, memory ${photoIndex + 1}`;
    coupleReveal.hidden = false;
    coupleReveal.classList.remove('is-visible');
    void coupleReveal.offsetWidth;
    coupleReveal.classList.add('is-visible');
    heartIntroTimer = window.setTimeout(() => {
      if (!sessionUnlocked) return;
      coupleReveal.hidden = true;
      coupleReveal.classList.remove('is-visible');
      envelopeStage.hidden = false;
      envelopeStage.classList.add('is-revealed');
      sessionStatus.hidden = false;
      envelopeStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, reducedMotion ? 2500 : 2500);
  }, revealDelay);
});

passwordInput.addEventListener('input', () => {
  passwordError.textContent = '';
});

let openingEnvelope = false;
let activeEnvelope = null;

function stopBirthdaySlideshow() {
  window.clearInterval(birthdaySlideshowTimer);
  birthdaySlideshowTimer = null;
  [birthdaySlideA, birthdaySlideB].forEach((slide) => {
    slide.classList.remove('is-active');
    slide.onload = null;
    slide.onerror = null;
    slide.removeAttribute('src');
  });
  birthdaySlideIndex = 0;
  birthdayActiveSlide = birthdaySlideA;
  birthdaySlideCount.textContent = `1 / ${couplePhotos.length}`;
}

function startBirthdaySlideshow() {
  stopBirthdaySlideshow();
  const showFirstSlide = () => birthdaySlideA.classList.add('is-active');
  birthdaySlideA.onload = showFirstSlide;
  birthdaySlideA.src = couplePhotos[0];
  if (birthdaySlideA.complete && birthdaySlideA.naturalWidth > 0) showFirstSlide();

  birthdaySlideshowTimer = window.setInterval(() => {
    const nextIndex = (birthdaySlideIndex + 1) % couplePhotos.length;
    const previousSlide = birthdayActiveSlide;
    const nextSlide = previousSlide === birthdaySlideA ? birthdaySlideB : birthdaySlideA;
    nextSlide.classList.remove('is-active');
    nextSlide.onload = () => {
      nextSlide.classList.add('is-active');
      nextSlide.alt = `Shared memory ${nextIndex + 1}`;
      nextSlide.setAttribute('aria-hidden', 'false');
      previousSlide.classList.remove('is-active');
      previousSlide.setAttribute('aria-hidden', 'true');
      birthdayActiveSlide = nextSlide;
      birthdaySlideIndex = nextIndex;
      birthdaySlideCount.textContent = `${nextIndex + 1} / ${couplePhotos.length}`;
      nextSlide.onload = null;
      nextSlide.onerror = null;
    };
    nextSlide.onerror = () => {
      nextSlide.onload = null;
      nextSlide.onerror = null;
      birthdaySlideIndex = nextIndex;
      birthdaySlideCount.textContent = `${nextIndex + 1} / ${couplePhotos.length}`;
    };
    nextSlide.src = couplePhotos[nextIndex];
    if (nextSlide.complete && nextSlide.naturalWidth > 0) nextSlide.onload();
  }, 5000);
}

envelopeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (openingEnvelope || letterDialog.open) return;
    openingEnvelope = true;
    activeEnvelope = button;
    envelopeButtons.forEach((item) => { item.disabled = true; });
    button.classList.add('open');

    const letterType = button.dataset.letter;
    document.querySelectorAll('[data-letter-content]').forEach((content) => {
      content.hidden = content.dataset.letterContent !== letterType;
    });
    letterDialogTitle.textContent = 'Birthday letter';
    letterDialog.classList.toggle('birthday-open', letterType === 'birthday');

    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    window.setTimeout(() => {
      letterDialog.showModal();
      letterDialogClose.focus();
      startBirthdaySlideshow();
      openingEnvelope = false;
    }, delay);
  });
});

function closeLetterDialog() {
  if (!letterDialog.open) return;
  letterDialog.close();
}

letterDialogClose.addEventListener('click', closeLetterDialog);
letterDialog.addEventListener('click', (event) => {
  if (event.target === letterDialog) closeLetterDialog();
});
letterDialog.addEventListener('close', () => {
  openingEnvelope = false;
  stopBirthdaySlideshow();
  letterDialog.classList.remove('birthday-open');
  if (activeEnvelope) activeEnvelope.classList.remove('open');
  envelopeButtons.forEach((item) => { item.disabled = false; });
  if (activeEnvelope) activeEnvelope.focus({ preventScroll: true });
  activeEnvelope = null;
});

