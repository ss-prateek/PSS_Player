// ==========================================================================
// PART 1: SONG DATABASE STORE
// ==========================================================================
const songDatabase = [
    {
        title: "On & On",
        artist: "Cartoon (NCS)",
        duration: "3:27",
        thumbnail: "https://img.youtube.com/vi/K4DyBUG242c/hqdefault.jpg",
        youtubeId: "K4DyBUG242c"
    },
    {
        title: "Invincible",
        artist: "DEAF KEV (NCS)",
        duration: "4:33",
        thumbnail: "https://img.youtube.com/vi/J2X5mJ3HDYE/hqdefault.jpg",
        youtubeId: "J2X5mJ3HDYE"
    },
    {
        title: "My Heart",
        artist: "Different Heaven (NCS)",
        duration: "4:27",
        thumbnail: "https://img.youtube.com/vi/jK2aIUmmdP4/hqdefault.jpg",
        youtubeId: "jK2aIUmmdP4"
    },
    {
        title: "Blank",
        artist: "Disfigure (NCS)",
        duration: "3:29",
        thumbnail: "https://img.youtube.com/vi/p7ZsBPK656s/hqdefault.jpg",
        youtubeId: "p7ZsBPK656s"
    },
    {
        title: "Why We Lose (feat. Coleman Trapp)",
        artist: "Cartoon (NCS)",
        duration: "3:56",
        thumbnail: "https://img.youtube.com/vi/zyXmsVwZqX4/hqdefault.jpg",
        youtubeId: "zyXmsVwZqX4"
    },
    {
        title: "Light It Up (feat. Jex)",
        artist: "Robin Hustin x TobiMorrow (NCS)",
        duration: "3:05",
        thumbnail: "https://img.youtube.com/vi/bdE_SyHad90/hqdefault.jpg",
        youtubeId: "bdE_SyHad90"
    },
    {
        title: "Royalty",
        artist: "Egzod & Maestro Chives & Neoni (NCS)",
        duration: "3:44",
        thumbnail: "https://img.youtube.com/vi/C5fLxtJH2Qs/hqdefault.jpg",
        youtubeId: "C5fLxtJH2Qs"
    },
    {
        title: "Make Me Move (feat. Karra)",
        artist: "Culture Code (NCS)",
        duration: "3:17",
        thumbnail: "https://img.youtube.com/vi/vBGiFtb8Rpw/hqdefault.jpg",
        youtubeId: "vBGiFtb8Rpw"
    }
];

// ==========================================================================
// PART 2: GLOBAL STATE VARIABLES & LOCAL STORAGE LOADER
// ==========================================================================
let activeTab = "trending"; 
let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || []; 
let searchQuery = ""; 
let isShuffle = JSON.parse(localStorage.getItem("isShuffle")) || false; 
let isRepeat = JSON.parse(localStorage.getItem("isRepeat")) || false; 

// Google Sheets logger URL to log user login history
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxxfyuCTRZXl8mRo4pbdub1iklUmbO6mC9cjx0h1DeBS1ISA56MWOwQ8uqWV8fUFMdQ8g/exec"; 

// ==========================================================================
// PART 3: DOM ELEMENTS REGISTRY
// ==========================================================================
const DOM = {
    // Containers
    container: document.querySelector(".container"),
    loginOverlay: document.getElementById("login-overlay"),
    songListContainer: document.getElementById("song-list-container"),
    recentlyPlayedList: document.getElementById("recently-played-list"),
    leftSidebar: document.querySelector(".left"),
    visualizer: document.getElementById("visualizer-container"),
    header: document.querySelector(".header"),
    
    // Auth inputs/messages
    loginName: document.getElementById("login-name"),
    loginEmail: document.getElementById("login-email"),
    loginError: document.getElementById("login-error"),
    userNameDisplay: document.getElementById("user-name-display"),
    
    // Auth & Navigation buttons
    loginSubmitBtn: document.getElementById("login-submit-btn"),
    logoutBtn: document.getElementById("logout-btn"),
    likedSongsTab: document.getElementById("liked-songs-tab"),
    trendingSongsTab: document.getElementById("trending-songs-tab"),
    
    // Search elements
    searchInput: document.getElementById("search-input"),
    searchContainer: document.getElementById("search-container"),
    headerSearchBtn: document.getElementById("header-search-btn"),
    searchCloseBtn: document.getElementById("search-close-btn"),
    librarySearchBtn: document.getElementById("library-search-btn"),
    
    // Playback control buttons
    playBtn: document.getElementById("play-btn"),
    pauseBtn: document.getElementById("pause-btn"),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    shuffleBtn: document.getElementById("shuffle-btn"),
    repeatBtn: document.getElementById("repeat-btn"),
    surpriseBtn: document.getElementById("surprise-btn"),
    videoOverlay: document.getElementById("video-overlay"),
    
    // Sliders
    seekSlider: document.getElementById("seek-slider"),
    
    // Active track display fields
    currentSongTitle: document.getElementById("current-song-title"),
    currentSongArtist: document.getElementById("current-song-artist"),
    
    // Responsive controllers
    hamburgerBtn: document.getElementById("hamburger-btn"),
    closeSidebarBtn: document.getElementById("close-sidebar-btn")
};

// ==========================================================================
// PART 4: LOGIN & LOGOUT OPERATIONS
// ==========================================================================

// Checks if the user session exists on startup to toggle Login Card vs Player Workspace
function checkLoginState() {
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));

    if (userProfile && userProfile.name) {
        if (DOM.loginOverlay) {
            DOM.loginOverlay.style.display = "none";
            DOM.loginOverlay.style.opacity = "0";
            DOM.loginOverlay.style.visibility = "hidden";
        }
        if (DOM.userNameDisplay) DOM.userNameDisplay.innerText = userProfile.name;
        if (DOM.container) DOM.container.style.display = "flex"; 
    } else {
        if (DOM.loginOverlay) DOM.loginOverlay.style.display = "flex";
        if (DOM.container) DOM.container.style.display = "none"; 
    }
}

// Initial session verification runs shortly after page startup
setTimeout(checkLoginState, 20); 

// Attaches actions to auth inputs (Verify email pattern, submit to webhook, logout session)
function setupLoginListeners() {
    if (DOM.loginSubmitBtn) {
        DOM.loginSubmitBtn.addEventListener("click", () => {
            const nameVal = DOM.loginName.value.trim();
            const emailVal = DOM.loginEmail.value.trim();

            // Match regular expression to check standard email formatting (name@domain.com)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (nameVal === "" || !emailRegex.test(emailVal)) {
                if (DOM.loginError) DOM.loginError.style.display = "block";
                return;
            }

            if (DOM.loginError) DOM.loginError.style.display = "none";

            // Save session profile locally to bypass logins on returning visits
            const profile = { name: nameVal, email: emailVal, timestamp: new Date().toISOString() };
            localStorage.setItem("userProfile", JSON.stringify(profile));

            if (DOM.userNameDisplay) DOM.userNameDisplay.innerText = nameVal;
            if (DOM.container) DOM.container.style.display = "flex";

            // Smoothly animate out login card overlay
            if (DOM.loginOverlay) {
                DOM.loginOverlay.style.opacity = "0";
                setTimeout(() => {
                    DOM.loginOverlay.style.display = "none";
                    DOM.loginOverlay.style.visibility = "hidden";
                }, 500); 
            }

            // Webhook Login Logger: encodeURIComponent converts characters like spaces and @ into URL-safe hex codes.
            // mode: 'no-cors' tells the browser to deliver the package one-way without waiting for responses,
            // which cleanly bypasses sandbox cross-origin (CORS) blocks on external scripts.
            if (GOOGLE_SHEET_API_URL !== "") {
                const url = `${GOOGLE_SHEET_API_URL}?name=${encodeURIComponent(nameVal)}&email=${encodeURIComponent(emailVal)}`;
                fetch(url, {
                    method: "GET",
                    mode: "no-cors"
                })
                .then(() => console.log("Login details successfully sent to Google Sheets."))
                .catch(err => console.error("Error logging to Google Sheets:", err));
            }
        });
    }

    if (DOM.logoutBtn) {
        DOM.logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("userProfile");
            location.reload(); 
        });
    }
}
setTimeout(setupLoginListeners, 50);

// Initialize visual buttons (Shuffle, Repeat) active color/glow if saved in browser storage
function initializeUtilityStates() {
    if (DOM.shuffleBtn) {
        DOM.shuffleBtn.style.color = isShuffle ? "white" : "#b3b3b3";
        DOM.shuffleBtn.style.textShadow = isShuffle ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    }
    if (DOM.repeatBtn) {
        DOM.repeatBtn.style.color = isRepeat ? "white" : "#b3b3b3";
        DOM.repeatBtn.style.textShadow = isRepeat ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    }
}
setTimeout(initializeUtilityStates, 50);

// ==========================================================================
// PART 5: DYNAMIC TAB RENDERER & SEARCH FILTER ENGINE
// ==========================================================================

// Iterates the song database, filters by active tab and search query, and creates HTML cards
function renderSongs() {
    if (!DOM.songListContainer) return;
    DOM.songListContainer.innerHTML = ""; 
    
    let renderedCount = 0; 
    
    songDatabase.forEach((song, index) => {
        const isLiked = likedSongs.includes(song.youtubeId);
        
        // Skip songs if on Liked Songs tab and the song is not liked
        if (activeTab === "liked" && !isLiked) return;
        
        // Skip songs if search query doesn't match song title or artist
        if (searchQuery !== "") {
            const titleMatch = song.title.toLowerCase().includes(searchQuery.toLowerCase());
            const artistMatch = song.artist.toLowerCase().includes(searchQuery.toLowerCase());
            if (!titleMatch && !artistMatch) return;
        }
        
        renderedCount++;
        
        const heartSymbol = isLiked ? "♥" : "♡";
        const likedClass = isLiked ? "liked-active" : "";
        
        let html = `
            <div class="card" data-index="${index}">
                <div class="image">
                    <img src="${song.thumbnail}" alt="${song.title} Cover Art">
                    <div class="capsule">${song.duration}</div>
                </div>
                <div class="text">
                    <h2>${song.title}</h2>
                    <p>${song.artist}</p>
                </div>
                <div>
                    <button class="like ${likedClass}" data-youtube-id="${song.youtubeId}">${heartSymbol}</button>
                </div>
            </div>`;
        
        DOM.songListContainer.innerHTML += html;
    });
    
    // Empty state displays
    if (renderedCount === 0) {
        if (activeTab === "liked" && searchQuery === "") {
            DOM.songListContainer.innerHTML = `
                <div style="text-align: center; color: #b3b3b3; padding: 40px 20px; font-weight: normal;">
                    <p style="font-size: 24px; margin-bottom: 10px;">♥</p>
                    <p style="font-size: 16px;">No liked songs yet.</p>
                    <p style="font-size: 12px; margin-top: 5px;">Click the heart icon on any song to save it here!</p>
                </div>`;
        } else if (searchQuery !== "") {
            DOM.songListContainer.innerHTML = `
                <div style="text-align: center; color: #b3b3b3; padding: 40px 20px; font-weight: normal;">
                    <p style="font-size: 24px; margin-bottom: 10px;">🔍</p>
                    <p style="font-size: 16px;">No results found for "${searchQuery}"</p>
                    <p style="font-size: 12px; margin-top: 5px;">Check spelling or try searching another song!</p>
                </div>`;
        }
    }
}
renderSongs();

// Event Delegation Pattern: Instead of attaching 8 individual event listeners to 8 card elements
// (which wastes memory and breaks if songs reload), we attach a single listener to the parent container.
// e.target.closest() travels up the DOM tree to locate the clicked cell class (.like or .card) dynamically.
if (DOM.songListContainer) {
    DOM.songListContainer.addEventListener("click", (e) => {
        const heartBtn = e.target.closest(".like");
        if (heartBtn) {
            e.stopPropagation(); // Stops the click event from bubbling up and starting the song
            const ytid = heartBtn.getAttribute("data-youtube-id");
            toggleLikeSong(ytid);
            return;
        }
        
        const card = e.target.closest(".card");
        if (card) {
            const index = parseInt(card.getAttribute("data-index"));
            playSong(index);
        }
    });
}

function toggleLikeSong(ytid) {
    if (likedSongs.includes(ytid)) {
        likedSongs = likedSongs.filter(id => id !== ytid);
    } else {
        likedSongs.push(ytid);
    }
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    renderSongs();
}

if (DOM.likedSongsTab) {
    DOM.likedSongsTab.addEventListener("click", () => {
        activeTab = "liked";
        DOM.likedSongsTab.style.color = "white";       
        DOM.trendingSongsTab.style.color = "#b3b3b3";   
        renderSongs();                        
    });
}

if (DOM.trendingSongsTab) {
    DOM.trendingSongsTab.addEventListener("click", () => {
        activeTab = "trending";
        DOM.trendingSongsTab.style.color = "white";    
        DOM.likedSongsTab.style.color = "#b3b3b3";     
        renderSongs();                        
    });
}

// ==========================================================================
// PART 6: YOUTUBE IFRAME API CORE LOADER & EVENT HANDLERS
// ==========================================================================
let player;                  
let currentSongIndex = 0;    
let isPlaying = false;       
let progressInterval;        

// Callback function triggered automatically by the YouTube API script loading
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '130',                      
        width: '220',                       
        videoId: songDatabase[0].youtubeId,  
        playerVars: {
            'controls': 0,                  // Hide standard player timeline and controls bar
            'disablekb': 1,                 // Block iframe focus keyboard hotkeys
            'modestbranding': 1,            // Remove YouTube layout watermark logo
            'rel': 0                        // Block related videos at the end
        },
        events: {
            'onStateChange': onPlayerStateChange 
        }
    });
}

// Handler that triggers when video states change (e.g. tracks end)
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        if (isRepeat) {
            playSong(currentSongIndex); 
        } else {
            if (DOM.nextBtn) DOM.nextBtn.click();
        }
    }
}

// Primary play function: loads song, updates metadata display cards, and calls YouTube stream API
function playSong(index) {
    currentSongIndex = index;
    const song = songDatabase[index];

    if (DOM.currentSongTitle) DOM.currentSongTitle.innerText = song.title;
    if (DOM.currentSongArtist) DOM.currentSongArtist.innerText = song.artist;

    if (!player || typeof player.loadVideoById !== "function") return;

    player.loadVideoById(song.youtubeId);
    isPlaying = true; 
    
    updateVisualizerState();

    if (DOM.playBtn) DOM.playBtn.style.display = "none";
    if (DOM.pauseBtn) DOM.pauseBtn.style.display = "flex";

    startProgressBarTrack();
    addToRecentlyPlayed(song);
}

// Toggles visualizer keyframe bounces based on playback state
function updateVisualizerState() {
    if (!DOM.visualizer) return;
    if (isPlaying) {
        DOM.visualizer.classList.add("playing");
    } else {
        DOM.visualizer.classList.remove("playing");
    }
}

// ==========================================================================
// PART 7: PLAYER CONTROL DECK OPERATIONS
// ==========================================================================

if (DOM.playBtn) {
    DOM.playBtn.addEventListener("click", () => {
        if (player && typeof player.playVideo === "function") {
            player.playVideo();                 
            isPlaying = true;                   
            updateVisualizerState();
            DOM.playBtn.style.display = "none";     
            DOM.pauseBtn.style.display = "flex";    
            startProgressBarTrack();            
        }
    });
}

if (DOM.pauseBtn) {
    DOM.pauseBtn.addEventListener("click", () => {
        if (player && typeof player.pauseVideo === "function") {
            player.pauseVideo();                 
            isPlaying = false;                  
            updateVisualizerState();
            DOM.playBtn.style.display = "flex";     
            DOM.pauseBtn.style.display = "none";    
            clearInterval(progressInterval);    
        }
    });
}

// Queue Navigation: Math.random() generates decimal indices which are rounded down by Math.floor().
// Modulo (%) loops the index back to 0 when it exceeds playlist length, avoiding index-out-of-bounds.
if (DOM.nextBtn) {
    DOM.nextBtn.addEventListener("click", () => {
        if (isShuffle && songDatabase.length > 1) {
            let randomIndex = Math.floor(Math.random() * songDatabase.length);
            while (randomIndex === currentSongIndex) {
                randomIndex = Math.floor(Math.random() * songDatabase.length);
            }
            playSong(randomIndex);
        } else {
            let nextIndex = (currentSongIndex + 1) % songDatabase.length;
            playSong(nextIndex);
        }
    });
}

if (DOM.prevBtn) {
    DOM.prevBtn.addEventListener("click", () => {
        if (isShuffle && songDatabase.length > 1) {
            let randomIndex = Math.floor(Math.random() * songDatabase.length);
            while (randomIndex === currentSongIndex) {
                randomIndex = Math.floor(Math.random() * songDatabase.length);
            }
            playSong(randomIndex);
        } else {
            let prevIndex = (currentSongIndex - 1 + songDatabase.length) % songDatabase.length;
            playSong(prevIndex);
        }
    });
}

// Seek Slider progress tracking loop (checks every 500ms)
// Timeline Progress: startProgressBarTrack runs a 500ms query loop fetching current seconds 
// and total duration from the YouTube IFrame API to calculate the slider progress percentage: (current / total) * 100.
function startProgressBarTrack() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (player && isPlaying && typeof player.getCurrentTime === "function") {
            const currentTime = player.getCurrentTime(); 
            const duration = player.getDuration();       
            if (duration > 0 && DOM.seekSlider) {
                DOM.seekSlider.value = (currentTime / duration) * 100;
            }
        }
    }, 500);
}

// Timeline Seeking: Translates our input range slider's drag position (percentage) back into target seconds, 
// and commands the YouTube API to jump playback directly to that second point.
if (DOM.seekSlider) {
    DOM.seekSlider.addEventListener("input", () => {
        if (player && typeof player.seekTo === "function") {
            const duration = player.getDuration(); 
            const seekToSeconds = (DOM.seekSlider.value / 100) * duration;
            player.seekTo(seekToSeconds, true);
        }
    });
}

// Clicking the video overlay player box toggles play/pause states
if (DOM.videoOverlay) {
    DOM.videoOverlay.addEventListener("click", () => {
        if (isPlaying) {
            if (DOM.pauseBtn) DOM.pauseBtn.click();
        } else {
            if (DOM.playBtn) DOM.playBtn.click();
        }
    });
}

// Playback modifiers: Shuffle, Repeat, Surprise Me
if (DOM.shuffleBtn) {
    DOM.shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;
        localStorage.setItem("isShuffle", JSON.stringify(isShuffle));
        DOM.shuffleBtn.style.color = isShuffle ? "white" : "#b3b3b3";
        DOM.shuffleBtn.style.textShadow = isShuffle ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    });
}

if (DOM.repeatBtn) {
    DOM.repeatBtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        localStorage.setItem("isRepeat", JSON.stringify(isRepeat));
        DOM.repeatBtn.style.color = isRepeat ? "white" : "#b3b3b3";
        DOM.repeatBtn.style.textShadow = isRepeat ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    });
}

if (DOM.surpriseBtn) {
    DOM.surpriseBtn.addEventListener("click", () => {
        if (songDatabase.length > 0) {
            const randomIndex = Math.floor(Math.random() * songDatabase.length);
            playSong(randomIndex);
        }
    });
}

// ==========================================================================
// PART 8: RECENTLY PLAYED HISTORY QUEUE
// ==========================================================================
let recentlyPlayed = []; 

// Adds a song to the history unshift queue, limits list size to 6, and updates sidebar UI
function addToRecentlyPlayed(song) {
    recentlyPlayed = recentlyPlayed.filter(item => item.youtubeId !== song.youtubeId);
    recentlyPlayed.unshift(song);
    
    if (recentlyPlayed.length > 6) {
        recentlyPlayed.pop();
    }
    updateRecentlyPlayedUI();
}

function updateRecentlyPlayedUI() {
    if (!DOM.recentlyPlayedList) return;
    DOM.recentlyPlayedList.innerHTML = "";
    
    recentlyPlayed.forEach(song => {
        let li = document.createElement("li");
        li.setAttribute("data-youtube-id", song.youtubeId);
        li.innerHTML = `
            <img src="${song.thumbnail}" alt="${song.title} Cover Art">
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 14px; color: white; font-weight: bold; line-height: 1.2;">${song.title}</span>
                <span style="font-size: 11px; color: #b3b3b3; font-weight: normal; line-height: 1.2;">${song.artist}</span>
            </div>
        `;
        DOM.recentlyPlayedList.appendChild(li);
    });
}

// Clicking a recently played list item loads and starts playing the track
if (DOM.recentlyPlayedList) {
    DOM.recentlyPlayedList.addEventListener("click", (e) => {
        const item = e.target.closest("li");
        if (item) {
            const ytid = item.getAttribute("data-youtube-id");
            if (!ytid) return;
            
            const index = songDatabase.findIndex(song => song.youtubeId === ytid);
            if (index !== -1) {
                playSong(index);
            }
        }
    });
}

// ==========================================================================
// PART 9: SEARCH CONTROLLERS & TOGGLES
// ==========================================================================

function openSearch() {
    if (DOM.headerSearchBtn) DOM.headerSearchBtn.style.display = "none";
    if (DOM.searchContainer) DOM.searchContainer.style.display = "flex";
    if (DOM.header) DOM.header.classList.add("search-active");
    if (DOM.searchInput) DOM.searchInput.focus();
}

function closeSearch() {
    searchQuery = "";
    if (DOM.searchInput) DOM.searchInput.value = "";
    if (DOM.searchContainer) DOM.searchContainer.style.display = "none";
    if (DOM.headerSearchBtn) DOM.headerSearchBtn.style.display = "flex";
    if (DOM.header) DOM.header.classList.remove("search-active");
    renderSongs(); 
}

if (DOM.headerSearchBtn) DOM.headerSearchBtn.addEventListener("click", openSearch);
if (DOM.librarySearchBtn) DOM.librarySearchBtn.addEventListener("click", openSearch);
if (DOM.searchCloseBtn) DOM.searchCloseBtn.addEventListener("click", closeSearch);

if (DOM.searchInput) {
    DOM.searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderSongs(); 
    });
}

// ==========================================================================
// PART 10: HAMBURGER SIDEBAR SLIDE DRAWER HANDLERS
// ==========================================================================

if (DOM.hamburgerBtn) {
    DOM.hamburgerBtn.addEventListener("click", () => {
        if (DOM.leftSidebar) DOM.leftSidebar.classList.add("open");
    });
}

if (DOM.closeSidebarBtn) {
    DOM.closeSidebarBtn.addEventListener("click", () => {
        if (DOM.leftSidebar) DOM.leftSidebar.classList.remove("open");
    });
}

// Close the sidebar automatically if a user clicks a song card
document.addEventListener("click", (e) => {
    if (e.target.closest(".card") && DOM.leftSidebar) {
        DOM.leftSidebar.classList.remove("open");
    }
});