/* script.js
   RPG Hub Music Player
   Complete logic and functionality.
*/

const playlist = [
    { title: "Enter the Dynasty", src: "./music/Enter the Dynasty.mp3" },
    { title: "Hear the Call", src: "./music/Hear the Call.mp3" },
    { title: "Come Home", src: "./music/Come Home.mp3" }
];

const skins = [
    "./backgrounds/cosmic1.jpg", "./backgrounds/cosmic2.jpg", "./backgrounds/cosmic3.jpg",
    "./backgrounds/cosmic4.jpg", "./backgrounds/cosmic5.jpg", "./backgrounds/cosmic6.jpg",
    "./backgrounds/cosmic7.jpg", "./backgrounds/cosmic8.jpg", "./backgrounds/cosmic9.jpg",
    "./backgrounds/cosmic10.jpg", "./backgrounds/cosmic11.jpg"
];

// Audio Object
const audio = new Audio();
let currentTrackIndex = 0;
let isRepeating = false;
let isPlaying = false;

// DOM Elements
const player = document.getElementById('player');
const playlistContainer = document.getElementById('playlist-container');
const skinSelector = document.getElementById('skin-selector');
const playPauseBtn = document.getElementById('play-pause-btn');
const stopBtn = document.getElementById('stop-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');

// Initialize Player
function initPlayer() {
    buildPlaylist();
    buildSkinSelector();
    loadPreferences();
    loadTrack(currentTrackIndex, false);
}

// Build Playlist UI
function buildPlaylist() {
    playlistContainer.innerHTML = '';
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.textContent = track.title;
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex, true);
        });
        playlistContainer.appendChild(item);
    });
}

// Build Skin Selector UI
function buildSkinSelector() {
    skinSelector.innerHTML = '';
    skins.forEach((skin, index) => {
        const option = document.createElement('option');
        option.value = skin;
        option.textContent = `Cosmic ${index + 1}`;
        skinSelector.appendChild(option);
    });

    skinSelector.addEventListener('change', (e) => {
        applySkin(e.target.value);
        localStorage.setItem('rpg_music_skin', e.target.value);
    });
}

// Apply Skin
function applySkin(skinPath) {
    player.style.backgroundImage = `url('${skinPath}')`;
}

// Load Preferences from Local Storage
function loadPreferences() {
    const savedSkin = localStorage.getItem('rpg_music_skin');
    if (savedSkin && skins.includes(savedSkin)) {
        skinSelector.value = savedSkin;
        applySkin(savedSkin);
    } else {
        applySkin(skins[0]);
    }

    const savedVolume = localStorage.getItem('rpg_music_volume');
    if (savedVolume !== null) {
        audio.volume = savedVolume;
        volumeBar.value = savedVolume;
    } else {
        audio.volume = 0.5;
        volumeBar.value = 0.5;
    }

    const savedTrack = localStorage.getItem('rpg_music_track');
    if (savedTrack !== null && savedTrack < playlist.length) {
        currentTrackIndex = parseInt(savedTrack, 10);
    }
}

// Load and Play Track
function loadTrack(index, playImmediately) {
    audio.src = playlist[index].src;
    updatePlaylistHighlight(index);
    localStorage.setItem('rpg_music_track', index);
    
    if (playImmediately) {
        audio.play();
        isPlaying = true;
        updatePlayPauseUI();
    }
}

// Highlight Current Track in Playlist
function updatePlaylistHighlight(index) {
    const items = playlistContainer.querySelectorAll('.playlist-item');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Format Time (Seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Audio Event Listeners
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playNext();
    }
});

// Control Functions
function togglePlayPause() {
    if (audio.paused) {
        audio.play();
        isPlaying = true;
    } else {
        audio.pause();
        isPlaying = false;
    }
    updatePlayPauseUI();
}

function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updatePlayPauseUI();
}

function playNext() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex, true);
}

function playPrev() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex, true);
}

function toggleRepeat() {
    isRepeating = !isRepeating;
    repeatBtn.style.opacity = isRepeating ? "1" : "0.5";
    repeatBtn.style.color = isRepeating ? "var(--accent)" : "var(--gold)";
}

// Update Play/Pause Button SVG (Basic text fallback if SVG isn't used)
function updatePlayPauseUI() {
    if (isPlaying) {
        playPauseBtn.setAttribute('data-state', 'playing');
    } else {
        playPauseBtn.setAttribute('data-state', 'paused');
    }
}

// Input Event Listeners
progressBar.addEventListener('input', (e) => {
    if (audio.duration) {
        audio.currentTime = (e.target.value / 100) * audio.duration;
    }
});

volumeBar.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    localStorage.setItem('rpg_music_volume', audio.volume);
});

playPauseBtn.addEventListener('click', togglePlayPause);
stopBtn.addEventListener('click', stopAudio);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);
repeatBtn.addEventListener('click', toggleRepeat);

// Run Initialization
initPlayer();
