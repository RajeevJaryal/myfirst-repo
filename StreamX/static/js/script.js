console.log('Let’s write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder = "punjabi"; // default folder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        const response = await fetch(`/api/songs/${folder}`);
        songs = await response.json();

        updatePlaylistUI(songs);
        attachSongEventListeners();
    } catch (err) {
        console.error("Error loading songs:", err);
    }
}

function updatePlaylistUI(songs) {
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        const displayName = decodeURIComponent(song.replace(/(%20|\.mp3)/g, " ")).trim();
        songUL.innerHTML += `
            <li data-filename="${song}">
                <img src="/static/img/music.svg" alt="song">
                <div class="info">
                    <div>${displayName}</div>
                    <div>Unknown</div>
                </div>
                <img class="invert" src="/static/img/play.svg">
            </li>
        `;
    }
}

function attachSongEventListeners() {
    document.querySelectorAll(".songList li").forEach(item => {
        item.addEventListener("click", () => {
            const filename = item.getAttribute("data-filename");
            playMusic(filename);
        });
    });
}

function playMusic(filename) {
    currentSong.src = `/songs/${currFolder}/${filename}`;
    currentSong.addEventListener("canplaythrough", () => currentSong.play(), { once: true });

    document.querySelector("#play").src = "/static/img/pause.svg";
    const displayName = decodeURIComponent(filename.replace(/(%20|\.mp3)/g, " ")).trim();
    document.querySelector(".songinfo").textContent = displayName;
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
}

async function main() {
    await getSongs("punjabi");

    // Play / Pause
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "/static/img/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "/static/img/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").textContent =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        const seekBarWidth = e.target.getBoundingClientRect().width;
        const percent = e.offsetX / seekBarWidth;
        currentSong.currentTime = percent * currentSong.duration;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // Volume control
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseFloat(e.target.value) / 100;
    });

    // Load songs when card is clicked
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.getAttribute("data-folder");
            await getSongs(folder);
        });
    });

    // Next song
    document.querySelector("#next").addEventListener("click", () => {
        let current = currentSong.src.split("/").pop();
        let index = songs.indexOf(current);
        if (index !== -1 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Previous song
    document.querySelector("#previous").addEventListener("click", () => {
        let current = currentSong.src.split("/").pop();
        let index = songs.indexOf(current);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "100%";
    });
}

main();
