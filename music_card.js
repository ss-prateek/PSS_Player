// 1. DATA DATABASE: A list of song objects. Each object stores information about a single track.
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
// 2. STATE MANAGER: Set up current tabs state and liked songs persistence
// ==========================================================================

let activeTab = "trending"; // Can be "trending" or "liked"
let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || []; // Load liked songs from localStorage
let searchQuery = ""; // Global tracker for search input queries
// --- SHUFFLE & REPEAT SETTINGS ---
// Load if Shuffle and Repeat are turned on or off from the browser's memory (localStorage)
let isShuffle = JSON.parse(localStorage.getItem("isShuffle")) || false; 
let isRepeat = JSON.parse(localStorage.getItem("isRepeat")) || false; 

// --- GOOGLE SHEETS / DATA LOGGING INTEGRATION ---
// This is your Google Sheet API connection link. When someone enters their name and email,
// this URL acts as a receiver and automatically writes a new row inside your Google Sheet!
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxxfyuCTRZXl8mRo4pbdub1iklUmbO6mC9cjx0h1DeBS1ISA56MWOwQ8uqWV8fUFMdQ8g/exec"; 

// --- INITIALIZE BUTTON COLOR STYLES ---
// When the page first loads, this function checks if Shuffle or Repeat was left "ON" in the browser's memory.
// If it was "ON", it colors the button solid white with a glowing shadow so it looks active.
function initializeUtilityStates() {
    const shuffleBtn = document.getElementById("shuffle-btn");
    const repeatBtn = document.getElementById("repeat-btn");
    if (shuffleBtn) {
        shuffleBtn.style.color = isShuffle ? "white" : "#b3b3b3";
        shuffleBtn.style.textShadow = isShuffle ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    }
    if (repeatBtn) {
        repeatBtn.style.color = isRepeat ? "white" : "#b3b3b3";
        repeatBtn.style.textShadow = isRepeat ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    }
}
// Run the styling check slightly after the page loads to make sure the HTML is fully ready
setTimeout(initializeUtilityStates, 50); 

// --- LOGIN FLOW SYSTEM ---
// This function controls if the user sees the Login Card or the Music Player.
// It checks the browser's memory (localStorage) for a saved name and email.
function checkLoginState() {
    const overlay = document.getElementById("login-overlay");
    const nameDisplay = document.getElementById("user-name-display");
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    const container = document.querySelector(".container");

    if (userProfile && userProfile.name) {
        // CASE A: User is already logged in!
        // 1. Hide the login form overlay
        if (overlay) {
            overlay.style.display = "none";
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden";
        }
        // 2. Put their saved name inside the top-right profile slot
        if (nameDisplay) {
            nameDisplay.innerText = userProfile.name;
        }
        // 3. Reveal the main music player workspace
        if (container) {
            container.style.display = "flex"; 
        }
    } else {
        // CASE B: User is NOT logged in yet!
        // 1. Keep the login overlay form visible
        if (overlay) {
            overlay.style.display = "flex";
        }
        // 2. Hide the music player container so it doesn't show behind the login card
        if (container) {
            container.style.display = "none"; 
        }
    }
}
// Check the login state shortly after page loads
setTimeout(checkLoginState, 20); 

// --- SETUP LOGIN & LOGOUT INTERACTIONS ---
// This function attaches actions to the Submit and Log Out buttons.
function setupLoginListeners() {
    const submitBtn = document.getElementById("login-submit-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const errorMsg = document.getElementById("login-error");

    // Click handler for the login form's "Enter Player" submit button
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            // Get the name and email values entered in the inputs
            const nameVal = document.getElementById("login-name").value.trim();
            const emailVal = document.getElementById("login-email").value.trim();

            // Check if name is blank, and test if email fits a standard email format (name@site.com)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (nameVal === "" || !emailRegex.test(emailVal)) {
                // If invalid: show the red error text and stop
                if (errorMsg) errorMsg.style.display = "block";
                return;
            }

            // If valid: hide the red error text
            if (errorMsg) errorMsg.style.display = "none";

            // Create a user profile profile and save it in browser memory so they stay logged in
            const profile = { name: nameVal, email: emailVal, timestamp: new Date().toISOString() };
            localStorage.setItem("userProfile", JSON.stringify(profile));

            // Set the top-right account text to the user's name
            const nameDisplay = document.getElementById("user-name-display");
            if (nameDisplay) nameDisplay.innerText = nameVal;

            // Make the main music player container visible so it starts fading in
            const container = document.querySelector(".container");
            if (container) container.style.display = "flex";

            // Smoothly fade out the black login overlay page
            const overlay = document.getElementById("login-overlay");
            if (overlay) {
                overlay.style.opacity = "0";
                setTimeout(() => {
                    overlay.style.display = "none";
                    overlay.style.visibility = "hidden";
                }, 500); // Wait 0.5s for the CSS fade-out animation to complete
            }

            // If your Google Sheet link is set, send a background request to record this login!
            if (GOOGLE_SHEET_API_URL !== "") {
                const url = `${GOOGLE_SHEET_API_URL}?name=${encodeURIComponent(nameVal)}&email=${encodeURIComponent(emailVal)}`;
                fetch(url, {
                    method: "GET",
                    mode: "no-cors" // no-cors bypasses cross-origin blocks when sending data to Google Sheets
                })
                .then(() => console.log("Login details successfully sent to Google Sheets."))
                .catch(err => console.error("Error logging to Google Sheets:", err));
            }
        });
    }

    // Click handler for the "Log Out" button
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Delete the saved user session from browser memory
            localStorage.removeItem("userProfile");
            // Reload the page, which automatically forces the login screen to reappear!
            location.reload(); 
        });
    }
}
// Set up these submit and logout click triggers on page load
setTimeout(setupLoginListeners, 50);

// ==========================================================================
// 3. CARD GENERATOR & RENDERER: Dynamically draws song lists based on the active tab
// ==========================================================================

function renderSongs() {
    const targetContainer = document.querySelector("#song-list-container");
    if (!targetContainer) return;
    
    targetContainer.innerHTML = ""; // Clear current list of cards
    
    let renderedCount = 0; // Track if we rendered any songs
    
    songDatabase.forEach((song, index) => {
        const isLiked = likedSongs.includes(song.youtubeId);
        
        // If we are on the "Liked songs" tab and this song is not liked, skip drawing it!
        if (activeTab === "liked" && !isLiked) return;
        
        // Filter by search query if text is typed
        if (searchQuery !== "") {
            const titleMatch = song.title.toLowerCase().includes(searchQuery.toLowerCase());
            const artistMatch = song.artist.toLowerCase().includes(searchQuery.toLowerCase());
            if (!titleMatch && !artistMatch) return;
        }
        
        renderedCount++;
        
        // Use a filled red heart for liked songs and an empty heart for unliked songs
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
                    <!-- Heart button tagged with the song's YouTube ID -->
                    <button class="like ${likedClass}" data-youtube-id="${song.youtubeId}">${heartSymbol}</button>
                </div>
            </div>`;
        
        targetContainer.innerHTML += html;
    });
    
    // Empty state fallback for Liked Songs or No search results found
    if (renderedCount === 0) {
        if (activeTab === "liked" && searchQuery === "") {
            targetContainer.innerHTML = `
                <div style="text-align: center; color: #b3b3b3; padding: 40px 20px; font-weight: normal;">
                    <p style="font-size: 24px; margin-bottom: 10px;">♥</p>
                    <p style="font-size: 16px;">No liked songs yet.</p>
                    <p style="font-size: 12px; margin-top: 5px;">Click the heart icon on any song to save it here!</p>
                </div>`;
        } else if (searchQuery !== "") {
            targetContainer.innerHTML = `
                <div style="text-align: center; color: #b3b3b3; padding: 40px 20px; font-weight: normal;">
                    <p style="font-size: 24px; margin-bottom: 10px;">🔍</p>
                    <p style="font-size: 16px;">No results found for "${searchQuery}"</p>
                    <p style="font-size: 12px; margin-top: 5px;">Check spelling or try searching another song!</p>
                </div>`;
        }
    }
}

// Initial draw of our songs on page boot
renderSongs();

// ==========================================================================
// 4. CLICK HANDLERS: Handles song card playing, liked toggles, and tab switches
// ==========================================================================

// Click listener on the middle song card list
document.querySelector("#song-list-container").addEventListener("click", (e) => {
    // 1. Check if the user clicked on the Like heart button
    const heartBtn = e.target.closest(".like");
    if (heartBtn) {
        e.stopPropagation(); // Stops playSong from firing!
        const ytid = heartBtn.getAttribute("data-youtube-id");
        toggleLikeSong(ytid);
        return;
    }
    
    // 2. Otherwise, check if they clicked on the card itself to start playback
    const card = e.target.closest(".card");
    if (card) {
        const index = parseInt(card.getAttribute("data-index"));
        playSong(index);
    }
});

// Toggles liked state for a song and saves updates to local storage
function toggleLikeSong(ytid) {
    if (likedSongs.includes(ytid)) {
        // Remove song from liked array (unlike)
        likedSongs = likedSongs.filter(id => id !== ytid);
    } else {
        // Add song to liked array (like)
        likedSongs.push(ytid);
    }
    
    // Save the array back to local storage
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    
    // Redraw the list of songs immediately to reflect changes
    renderSongs();
}

// Tab click listeners controlling header navigation switches
const likedTab = document.getElementById("liked-songs-tab");
const trendingTab = document.getElementById("trending-songs-tab");

likedTab.addEventListener("click", () => {
    activeTab = "liked";
    likedTab.style.color = "white";       // Make active tab text white/bright
    trendingTab.style.color = "#b3b3b3";   // Fade inactive tab text
    renderSongs();                        // Redraw list to show only liked songs
});

trendingTab.addEventListener("click", () => {
    activeTab = "trending";
    trendingTab.style.color = "white";    // Make active tab text white/bright
    likedTab.style.color = "#b3b3b3";     // Fade inactive tab text
    renderSongs();                        // Redraw list to show all database songs
});

//______________________________________________________________________________________________________________________________________________________________________

// 5. PLAYER VARIABLES: Setup variables to store player instances, indexes, and timers
let player;                  // Will hold our YouTube video player controller
let currentSongIndex = 0;    // Keeps track of the index of the song playing right now
let isPlaying = false;       // Set to true if a song is playing, and false if paused
let progressInterval;        // Stores the timer loop that moves the timeline slider

// 6. INITIALIZE PLAYER: Automatically called when the YouTube IFrame API script loads
function onYouTubeIframeAPIReady() {
    // Creates the YouTube player inside the 'yt-player' div in index.html
    player = new YT.Player('yt-player', {
        height: '130',                      // Set height to match standard widescreen 16:9 aspect ratio
        width: '220',                       // Set width to match right-sidebar display styling
        videoId: songDatabase[0].youtubeId,  // Set J-Lo as the first song loaded on boot
        playerVars: {
            'controls': 0,                  // HIDE YOUTUBE'S NATIVE CONTROLS (removes progress bar, play overlays, sound indicators)
            'disablekb': 1,                 // Disable keyboard controls on the video iframe
            'modestbranding': 1,            // Remove the YouTube logo footprint from the interface
            'rel': 0                        // Prevent showing recommended videos when a track ends
        },
        events: {
            'onStateChange': onPlayerStateChange // Assign function to run when video state changes (e.g. song ends)
        }
    });
}

//______________________________________________________________________________________________________________________________________________________________________

// 7. AUTO-SKIP ON END: Automatically skip to the next track when the active video ends
function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED is fired when a song finishes
    if (event.data === YT.PlayerState.ENDED) {
        if (isRepeat) {
            playSong(currentSongIndex); // Replay current song
        } else {
            // Trigger a click on the next track button to play the next song
            document.getElementById("next-btn").click();
        }
    }
}

// 8. PRIMARY PLAYBACK LOADER: Loads and starts playing a song from our database
function playSong(index) {
    // Save the new song index as the current active track
    currentSongIndex = index;
    // Get the song data matching this index number
    const song = songDatabase[index];

    // Update currently playing song display text under the visualizer
    const currentTitleEl = document.getElementById("current-song-title");
    const currentArtistEl = document.getElementById("current-song-artist");
    if (currentTitleEl) currentTitleEl.innerText = song.title;
    if (currentArtistEl) currentArtistEl.innerText = song.artist;

    // Safety check: Exit if the YouTube player has not initialized yet
    if (!player || typeof player.loadVideoById !== "function") return;

    // Load the video ID in the right sidebar iframe and start playing it
    player.loadVideoById(song.youtubeId);
    isPlaying = true; // Mark as playing
    updateVisualizerState();

    // Swap control icons: Hide the Play button, show the Pause button
    document.getElementById("play-btn").style.display = "none";
    document.getElementById("pause-btn").style.display = "flex";

    // Start the timer to move the seek slider as the song progress updates
    startProgressBarTrack();

    // Add the played song to the recently played list and redraw the sidebar UI
    addToRecentlyPlayed(song);
}

// Helper to update the visualizer animation state based on playback
function updateVisualizerState() {
    const visualizer = document.getElementById("visualizer-container");
    if (!visualizer) return;
    if (isPlaying) {
        visualizer.classList.add("playing");
    } else {
        visualizer.classList.remove("playing");
    }
}

//______________________________________________________________________________________________________________________________________________________________________

// 9. BUTTON CONTROLS: Find the play/pause buttons and assign their click actions
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");

// Play Button: Resumes playback
playBtn.addEventListener("click", () => {
    // Check if player is ready
    if (player && typeof player.playVideo === "function") {
        player.playVideo();                 // Tell YouTube to resume playing
        isPlaying = true;                   // Mark state as playing
        updateVisualizerState();
        playBtn.style.display = "none";     // Hide Play button
        pauseBtn.style.display = "flex";    // Show Pause button
        startProgressBarTrack();            // Resume progress bar updates
    }
});

// Pause Button: Pauses playback
pauseBtn.addEventListener("click", () => {
    // Check if player is ready
    if (player && typeof player.pauseVideo === "function") {
        player.pauseVideo();                 // Tell YouTube to pause
        isPlaying = false;                  // Mark state as paused
        updateVisualizerState();
        playBtn.style.display = "flex";     // Show Play button
        pauseBtn.style.display = "none";    // Hide Pause button
        clearInterval(progressInterval);    // Turn off the timer loop to save browser memory
    }
});

//______________________________________________________________________________________________________________________________________________________________________

// 10. SKIP NAVIGATION: Bind actions to Next and Previous skip buttons
// Next Button click handler (respects Shuffle mode)
document.getElementById("next-btn").addEventListener("click", () => {
    if (isShuffle && songDatabase.length > 1) {
        let randomIndex = Math.floor(Math.random() * songDatabase.length);
        while (randomIndex === currentSongIndex) {
            randomIndex = Math.floor(Math.random() * songDatabase.length);
        }
        playSong(randomIndex);
    } else {
        // Move to the next index
        let nextIndex = currentSongIndex + 1;
        // If we pass the last song in our list, circle back to the first song (index 0)
        if (nextIndex >= songDatabase.length) nextIndex = 0;
        playSong(nextIndex);
    }
});

// Previous Button click handler (respects Shuffle mode)
document.getElementById("prev-btn").addEventListener("click", () => {
    if (isShuffle && songDatabase.length > 1) {
        let randomIndex = Math.floor(Math.random() * songDatabase.length);
        while (randomIndex === currentSongIndex) {
            randomIndex = Math.floor(Math.random() * songDatabase.length);
        }
        playSong(randomIndex);
    } else {
        // Move to the previous index
        let prevIndex = currentSongIndex - 1;
        // If we go below the first song, wrap around to the last song in the database
        if (prevIndex < 0) prevIndex = songDatabase.length - 1;
        playSong(prevIndex);
    }
});

//______________________________________________________________________________________________________________________________________________________________________

// 11. TIMELINE PROGRESS TRACKER: Moves the range slider as the music plays
const seekSlider = document.getElementById("seek-slider");

function startProgressBarTrack() {
    // Clear any active timer first to avoid multiple clocks running at the same time
    clearInterval(progressInterval);
    
    // Set a recurring timer to check time every 500 milliseconds (half a second)
    progressInterval = setInterval(() => {
        // Only run if the player is active, playing, and has the API functions ready
        if (player && isPlaying && typeof player.getCurrentTime === "function") {
            const currentTime = player.getCurrentTime(); // Elapsed time in seconds
            const duration = player.getDuration();       // Total video length in seconds
            
            // Avoid division error if duration isn't loaded yet
            if (duration > 0) {
                // Calculate percentage of track played and update the slider position
                seekSlider.value = (currentTime / duration) * 100;
            }
        }
    }, 500);
}

// 12. TIMELINE SEEK CONTROLLER: Seek to a different part of the song when user drags the slider
seekSlider.addEventListener("input", () => {
    // Only run if player is active and has the seek function ready
    if (player && typeof player.seekTo === "function") {
        const duration = player.getDuration(); // Get total video duration
        // Translate slider percentage back to target seconds (e.g. 50% slider value = half the song duration)
        const seekToSeconds = (seekSlider.value / 100) * duration;
        // Command YouTube to skip to that second immediately
        player.seekTo(seekToSeconds, true);
    }
});

// 13. OVERLAY CLICK CONTROLLER: Trigger play/pause toggles when clicking anywhere on the cover art player box
document.getElementById("video-overlay").addEventListener("click", () => {
    // If a song is currently playing, click the Pause button. Otherwise, click the Play button.
    if (isPlaying) {
        pauseBtn.click();
    } else {
        playBtn.click();
    }
});

//______________________________________________________________________________________________________________________________________________________________________

// ==========================================================================
// 14. RECENTLY PLAYED TRACK STORAGE & RENDERING CONTROLLERS
// ==========================================================================

let recentlyPlayed = []; // Global array holding recently played track objects

// Adds a song to the history storage array, ensuring no duplicates, and updates the list display
function addToRecentlyPlayed(song) {
    // Filter out this song if it is already in the list to avoid duplicate entries
    recentlyPlayed = recentlyPlayed.filter(item => item.youtubeId !== song.youtubeId);
    
    // Add the song to the absolute front (index 0) of the list
    recentlyPlayed.unshift(song);
    
    // Limit our history list to a maximum of 6 songs to preserve sidebar height spacing
    if (recentlyPlayed.length > 6) {
        recentlyPlayed.pop();
    }
    
    // Redraw the left sidebar list with the updated entries
    updateRecentlyPlayedUI();
}

// Redraws the left sidebar playlist column with the recently played songs dynamically
function updateRecentlyPlayedUI() {
    const listContainer = document.getElementById("recently-played-list");
    if (!listContainer) return;
    
    // Clear the current list
    listContainer.innerHTML = "";
    
    // Draw each played song cell into the sidebar
    recentlyPlayed.forEach(song => {
        let li = document.createElement("li");
        // Set the custom data attribute to identify the video on click events
        li.setAttribute("data-youtube-id", song.youtubeId);
        
        li.innerHTML = `
            <img src="${song.thumbnail}" alt="${song.title} Cover Art">
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 14px; color: white; font-weight: bold; line-height: 1.2;">${song.title}</span>
                <span style="font-size: 11px; color: #b3b3b3; font-weight: normal; line-height: 1.2;">${song.artist}</span>
            </div>
        `;
        listContainer.appendChild(li);
    });
}

// Click Listener for Recently Played List: Click sidebar song to play it immediately
document.getElementById("recently-played-list").addEventListener("click", (e) => {
    const item = e.target.closest("li");
    if (item) {
        const ytid = item.getAttribute("data-youtube-id");
        // Check if it's the placeholder (which has no data-youtube-id attribute)
        if (!ytid) return;
        
        // Search our song database for the index matching this YouTube video ID
        const index = songDatabase.findIndex(song => song.youtubeId === ytid);
        if (index !== -1) {
            playSong(index);
        }
    }
});

// ==========================================================================
// 15. SEARCH CONTROLLERS: Toggles and drives input querying searches
// ==========================================================================

const searchInput = document.getElementById("search-input");
const searchContainer = document.getElementById("search-container");
const headerSearchBtn = document.getElementById("header-search-btn");
const searchCloseBtn = document.getElementById("search-close-btn");
const librarySearchBtn = document.getElementById("library-search-btn");

// Function to reveal and focus the search input field
function openSearch() {
    headerSearchBtn.style.display = "none";
    searchContainer.style.display = "flex";
    const header = document.querySelector(".header");
    if (header) header.classList.add("search-active");
    searchInput.focus();
}

// Function to close search, clear inputs, and restore list views
function closeSearch() {
    searchQuery = "";
    searchInput.value = "";
    searchContainer.style.display = "none";
    headerSearchBtn.style.display = "flex";
    const header = document.querySelector(".header");
    if (header) header.classList.remove("search-active");
    renderSongs(); // Redraw full list
}

// Event listeners opening search on button clicks
if (headerSearchBtn) headerSearchBtn.addEventListener("click", openSearch);
if (librarySearchBtn) librarySearchBtn.addEventListener("click", openSearch);

// Close search bar click handler
if (searchCloseBtn) searchCloseBtn.addEventListener("click", closeSearch);

// Type detector running dynamic filtering on input queries
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderSongs(); // Dynamically filters list cards on every keystroke
    });
}

// ==========================================================================
// 16. PLAYBACK UTILITY DECK CONTROLLERS (Shuffle, Surprise Me, Repeat)
// ==========================================================================

const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const surpriseBtn = document.getElementById("surprise-btn");

if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;
        localStorage.setItem("isShuffle", JSON.stringify(isShuffle));
        shuffleBtn.style.color = isShuffle ? "white" : "#b3b3b3";
        shuffleBtn.style.textShadow = isShuffle ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    });
}

if (repeatBtn) {
    repeatBtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        localStorage.setItem("isRepeat", JSON.stringify(isRepeat));
        repeatBtn.style.color = isRepeat ? "white" : "#b3b3b3";
        repeatBtn.style.textShadow = isRepeat ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none";
    });
}

if (surpriseBtn) {
    surpriseBtn.addEventListener("click", () => {
        if (songDatabase.length > 0) {
            const randomIndex = Math.floor(Math.random() * songDatabase.length);
            playSong(randomIndex);
        }
    });
}

// ==========================================================================
// 17. MAKING PAGE RESPONSIVE
//

// RESPONSIVE HAMBURGER SIDEBAR LOGIC
const hamburgerBtn = document.getElementById("hamburger-btn");
const closeSidebarBtn = document.getElementById("close-sidebar-btn");
const leftSidebar = document.querySelector(".left");

// 1. When the Hamburger is clicked, add the "open" class to slide in the sidebar
if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
        leftSidebar.classList.add("open");
    });
}

// 2. When the Close button is clicked, remove the "open" class to slide it back out
if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", () => {
        leftSidebar.classList.remove("open");
    });
}

// 3. (Extra convenience) Close the sidebar automatically if a user clicks a song card!
document.addEventListener("click", (e) => {
    // If the click is inside a song card, close the sidebar
    if (e.target.closest(".song-card")) {
        leftSidebar.classList.remove("open");
    }
});