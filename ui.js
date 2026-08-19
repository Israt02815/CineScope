"use strict";


/* =========================================================
   CONFIG
   ========================================================= */

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


/* =========================================================
   WATCHLIST
   ========================================================= */

let watchlist =
    JSON.parse(
        localStorage.getItem("cinescopeWatchlist")
    ) || [];

let currentMovies = [];


/* =========================================================
   IMAGE
   ========================================================= */

function getPoster(movie) {

    if (
        movie &&
        movie.poster_path
    ) {
        return IMAGE_BASE_URL + movie.poster_path;
    }

    return createPlaceholder(movie);
}


/* =========================================================
   PLACEHOLDER
   ========================================================= */

function createPlaceholder(movie) {

    const title =
        movie?.title ||
        movie?.name ||
        "Movie";

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="500"
            height="750"
        >
            <defs>
                <linearGradient
                    id="bg"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stop-color="#17152d"
                    />

                    <stop
                        offset="50%"
                        stop-color="#302854"
                    />

                    <stop
                        offset="100%"
                        stop-color="#101123"
                    />
                </linearGradient>
            </defs>

            <rect
                width="500"
                height="750"
                fill="url(#bg)"
            />

            <circle
                cx="250"
                cy="290"
                r="100"
                fill="none"
                stroke="#d8b477"
                stroke-width="2"
                opacity=".35"
            />

            <text
                x="250"
                y="315"
                text-anchor="middle"
                font-size="65"
                fill="#d8b477"
            >
                ✦
            </text>

            <text
                x="250"
                y="500"
                text-anchor="middle"
                font-family="Georgia"
                font-size="34"
                fill="#ffffff"
            >
                CineScope
            </text>

            <text
                x="250"
                y="545"
                text-anchor="middle"
                font-family="Arial"
                font-size="15"
                fill="#aaa"
            >
                Poster unavailable
            </text>

            <text
                x="250"
                y="590"
                text-anchor="middle"
                font-family="Arial"
                font-size="13"
                fill="#888"
            >
                ${escapeHTML(title)}
            </text>
        </svg>
    `;

    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   MOVIE CARD
   ========================================================= */

function createMovieCard(movie) {

    const title =
        movie.title ||
        movie.name ||
        "Untitled";

    const year =
        movie.release_date
            ? movie.release_date.substring(0, 4)
            : "N/A";

    const rating =
        movie.vote_average
            ? Number(movie.vote_average).toFixed(1)
            : "N/A";

    const isSaved =
        watchlist.some(
            item =>
                Number(item.id) ===
                Number(movie.id)
        );

    return `
        <article
            class="movie-card"
            data-movie-id="${movie.id}"
            tabindex="0"
            role="button"
            aria-label="Open ${escapeHTML(title)}"
        >

            <div class="movie-poster">

                <img
                    src="${getPoster(movie)}"
                    alt="${escapeHTML(title)}"
                    loading="lazy"
                >

                <button
                    class="movie-action watchlist-btn"
                    type="button"
                    data-id="${movie.id}"
                    title="${
                        isSaved
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                    }"
                    aria-label="${
                        isSaved
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                    }"
                >

                    <i
                        class="${
                            isSaved
                                ? "fa-solid"
                                : "fa-regular"
                        } fa-heart"
                    ></i>

                </button>

            </div>

            <div class="movie-info">

                <h3 class="movie-title">
                    ${escapeHTML(title)}
                </h3>

                <div class="movie-meta">

                    <span>
                        ${year}
                    </span>

                    <span class="movie-rating">

                        <i class="fa-solid fa-star"></i>

                        ${rating}

                    </span>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   RENDER MOVIES
   ========================================================= */

function renderMovies(movies) {

    const grid =
        document.querySelector("#movieGrid") ||
        document.querySelector(".movie-grid");

    if (!grid) {

        console.error(
            "Movie grid #movieGrid was not found."
        );

        return;
    }

    currentMovies =
        Array.isArray(movies)
            ? movies
            : [];

    if (currentMovies.length === 0) {

        grid.innerHTML = `

            <div class="no-results">

                <div class="empty-icon">
                    🎬
                </div>

                <h3>
                    No movies found
                </h3>

                <p>
                    Try searching for another movie.
                </p>

            </div>

        `;

        return;
    }

    grid.innerHTML =
        currentMovies
            .map(movie => createMovieCard(movie))
            .join("");
}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    const grid =
        document.querySelector("#movieGrid") ||
        document.querySelector(".movie-grid");

    if (!grid) return;

    grid.innerHTML = `

        <div class="loading">

            <div class="loader"></div>

            <p>
                Discovering movies...
            </p>

        </div>

    `;
}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    const grid =
        document.querySelector("#movieGrid") ||
        document.querySelector(".movie-grid");

    if (!grid) return;

    grid.innerHTML = `

        <div class="error-message">

            <div class="empty-icon">
                ⚠
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;
}


/* =========================================================
   RESULTS TITLE
   ========================================================= */

function setResultsTitle(text) {

    const heading =
        document.querySelector("#resultsTitle");

    if (heading) {
        heading.textContent = text;
    }
}


/* =========================================================
   LOAD POPULAR MOVIES
   ========================================================= */

async function loadPopularMovies() {

    try {

        showLoading();

        const data =
            await getPopularMovies();

        setResultsTitle("Explore");

        renderMovies(
            data.results || []
        );

    } catch (error) {

        console.error(
            "Popular movies error:",
            error
        );

        showError(
            error.message || "Unable to load movies."
        );
    }
}


/* =========================================================
   SEARCH
   ========================================================= */

async function performSearch(query) {

    const searchTerm =
        String(query || "").trim();

    if (!searchTerm) {

        await loadPopularMovies();

        return;
    }

    try {

        showLoading();

        const data =
            await searchMovies(searchTerm);

        setResultsTitle(
            `Search results for "${searchTerm}"`
        );

        renderMovies(
            data.results || []
        );

    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        showError(
            error.message || "Search failed."
        );
    }
}


/* =========================================================
   SEARCH SETUP
   ========================================================= */

function setupSearch() {

    const input =
        document.querySelector("#searchInput");

    const button =
        document.querySelector("#searchButton");

    if (!input) {

        console.error(
            "Search input #searchInput not found."
        );

        return;
    }

    if (button) {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                performSearch(
                    input.value
                );
            }
        );
    }

    input.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch(
                    input.value
                );
            }
        }
    );

    input.addEventListener(
        "input",
        function() {

            if (!this.value.trim()) {

                setResultsTitle("Explore");

                loadPopularMovies();
            }
        }
    );
}


/* =========================================================
   SORTING
   ========================================================= */

function setupSorting() {

    const select =
        document.querySelector("#sortMovies");

    if (!select) return;

    select.addEventListener(
        "change",
        async function() {

            const value = this.value;

            try {

                showLoading();

                if (value === "popular") {

                    await loadPopularMovies();

                }

                else if (value === "rating") {

                    const data =
                        await getTopRatedMovies();

                    setResultsTitle(
                        "Highest Rated"
                    );

                    renderMovies(
                        data.results || []
                    );
                }

                else if (value === "newest") {

                    const data =
                        await getNowPlayingMovies();

                    setResultsTitle(
                        "Newest"
                    );

                    renderMovies(
                        data.results || []
                    );
                }

            } catch (error) {

                console.error(
                    "Sorting error:",
                    error
                );

                showError(
                    error.message || "Unable to sort movies."
                );
            }
        }
    );
}


/* =========================================================
   GENRES
   ========================================================= */

function setupGenres() {

    const genreButtons =
        document.querySelectorAll(".genre-card");

    genreButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function() {

                    const genreId =
                        this.dataset.genreId;

                    if (!genreId) {

                        console.error(
                            "Genre ID missing."
                        );

                        return;
                    }

                    try {

                        showLoading();

                        const data =
                            await getMoviesByGenre(
                                genreId
                            );

                        const genreName =
                            this.querySelector(
                                "span:last-child"
                            )?.textContent ||
                            "Genre";

                        setResultsTitle(
                            genreName
                        );

                        renderMovies(
                            data.results || []
                        );

                        document
                            .querySelector("#movies")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                    } catch (error) {

                        console.error(
                            "Genre error:",
                            error
                        );

                        showError(
                            error.message ||
                            "Unable to load this genre."
                        );
                    }
                }
            );
        }
    );
}


/* =========================================================
   WATCHLIST SAVE
   ========================================================= */

function saveWatchlist() {

    localStorage.setItem(
        "cinescopeWatchlist",
        JSON.stringify(watchlist)
    );
}


/* =========================================================
   TOGGLE WATCHLIST
   ========================================================= */

function toggleWatchlist(id) {

    const numericId =
        Number(id);

    const existingIndex =
        watchlist.findIndex(
            movie =>
                Number(movie.id) === numericId
        );

    if (existingIndex !== -1) {

        watchlist.splice(
            existingIndex,
            1
        );

    } else {

        const movie =
            currentMovies.find(
                item =>
                    Number(item.id) === numericId
            );

        if (movie) {

            watchlist.push(movie);
        }
    }

    saveWatchlist();

    renderMovies(currentMovies);

    renderWatchlist();
}


/* =========================================================
   RENDER WATCHLIST
   ========================================================= */

function renderWatchlist() {

    const grid =
        document.querySelector("#watchlistGrid");

    if (!grid) return;

    if (watchlist.length === 0) {

        grid.innerHTML = `

            <div class="no-results">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Your collection is waiting.
                </h3>

                <p>
                    Add movies you want to watch later.
                </p>

            </div>
        `;

        return;
    }

    grid.innerHTML =
        watchlist
            .map(movie => createMovieCard(movie))
            .join("");
}


/* =========================================================
   FIND MOVIE
   ========================================================= */

function findMovie(id) {

    const numericId =
        Number(id);

    return (
        currentMovies.find(
            movie =>
                Number(movie.id) === numericId
        )
        ||
        watchlist.find(
            movie =>
                Number(movie.id) === numericId
        )
    );
}


/* =========================================================
   CREATE MODAL
   ========================================================= */

function createModal() {

    let modal =
        document.querySelector("#movieModal");

    if (modal) {
        return modal;
    }

    modal =
        document.createElement("div");

    modal.id = "movieModal";

    modal.className = "modal";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.appendChild(modal);

    modal.addEventListener(
        "click",
        function(event) {

            if (event.target === modal) {

                closeModal();
            }
        }
    );

    return modal;
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    const modal =
        document.querySelector("#movieModal");

    if (!modal) return;

    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";

    const iframe =
        modal.querySelector("iframe");

    if (iframe) {
        iframe.src = "";
    }
}


/* =========================================================
   TRAILER
   ========================================================= */

async function openTrailer(id) {

    const movie =
        findMovie(id);

    if (!movie) {

        console.error(
            "Movie not found:",
            id
        );

        return;
    }

    try {

        const modal =
            createModal();

        modal.innerHTML = `

            <div
                class="modal-content"
                role="dialog"
                aria-modal="true"
                aria-label="Movie trailer"
            >

                <button
                    class="close-modal"
                    id="closeTrailerButton"
                    type="button"
                    aria-label="Close trailer"
                    title="Close"
                >
                    ×
                </button>

                <div class="trailer-player">

                    <div class="loading">

                        <div class="loader"></div>

                        <p>
                            Loading trailer...
                        </p>

                    </div>

                </div>

                <div class="modal-info">

                    <h2>
                        ${escapeHTML(
                            movie.title ||
                            movie.name ||
                            "Movie"
                        )}
                    </h2>

                </div>

            </div>
        `;

        const closeButton =
            modal.querySelector(
                "#closeTrailerButton"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    closeModal();
                }
            );
        }

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";

        const videos =
            await getMovieVideos(id);

        const trailer =
            videos.find(
                video =>
                    video.site === "YouTube" &&
                    video.type === "Trailer" &&
                    video.official === true &&
                    video.key
            )
            ||
            videos.find(
                video =>
                    video.site === "YouTube" &&
                    video.type === "Trailer" &&
                    video.key
            )
            ||
            videos.find(
                video =>
                    video.site === "YouTube" &&
                    video.key
            );

        const player =
            modal.querySelector(
                ".trailer-player"
            );

        if (!player) return;

        if (trailer) {

            player.innerHTML = `

                <div class="trailer-click-area">

                    <iframe
                        src="https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1"
                        title="${escapeHTML(
                            movie.title ||
                            movie.name ||
                            "Movie trailer"
                        )}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen
                    ></iframe>

                </div>
            `;

        } else {

            player.innerHTML = `

                <div class="no-trailer">

                    <i class="fa-solid fa-film"></i>

                    <h3>
                        Trailer unavailable
                    </h3>

                    <p>
                        No YouTube trailer was found for this movie.
                    </p>

                </div>
            `;
        }

    } catch (error) {

        console.error(
            "Trailer error:",
            error
        );

        const modal =
            document.querySelector("#movieModal");

        if (!modal) return;

        const player =
            modal.querySelector(".trailer-player");

        if (player) {

            player.innerHTML = `

                <div class="no-trailer">

                    <i
                        class="fa-solid fa-circle-exclamation"
                    ></i>

                    <h3>
                        Trailer unavailable
                    </h3>

                    <p>
                        We couldn't load the trailer.
                    </p>

                </div>
            `;
        }
    }
}


/* =========================================================
   THEME TOGGLE
   ========================================================= */

function setupThemeToggle() {

    const themeButton =
        document.querySelector(".theme-toggle");

    if (!themeButton) {
        return;
    }

    const savedTheme =
        localStorage.getItem(
            "cinescopeTheme"
        );

    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-theme"
        );
    }

    updateThemeIcon();

    themeButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            document.body.classList.toggle(
                "dark-theme"
            );

            const isDark =
                document.body.classList.contains(
                    "dark-theme"
                );

            localStorage.setItem(
                "cinescopeTheme",
                isDark ? "dark" : "light"
            );

            updateThemeIcon();
        }
    );
}


/* =========================================================
   UPDATE THEME ICON
   ========================================================= */

function updateThemeIcon() {

    const themeButton =
        document.querySelector(
            ".theme-toggle"
        );

    if (!themeButton) return;

    const icon =
        themeButton.querySelector("i");

    if (!icon) return;

    const isDark =
        document.body.classList.contains(
            "dark-theme"
        );

    if (isDark) {

        icon.className =
            "fa-solid fa-sun";

        themeButton.setAttribute(
            "aria-label",
            "Switch to light theme"
        );

        themeButton.setAttribute(
            "title",
            "Switch to light theme"
        );

    } else {

        icon.className =
            "fa-solid fa-moon";

        themeButton.setAttribute(
            "aria-label",
            "Switch to dark theme"
        );

        themeButton.setAttribute(
            "title",
            "Switch to dark theme"
        );
    }
}


/* =========================================================
   MOBILE HAMBURGER MENU
   ========================================================= */

function setupMobileMenu() {

    /*
     * Supports common hamburger button names:
     *
     * #menuToggle
     * #hamburger
     * .menu-toggle
     * .hamburger
     * .hamburger-menu
     * [data-menu-toggle]
     */

    const menuButton =
        document.querySelector(
            "#menuToggle, " +
            "#hamburger, " +
            ".menu-toggle, " +
            ".hamburger, " +
            ".hamburger-menu, " +
            "[data-menu-toggle]"
        );

    if (!menuButton) {

        console.warn(
            "Mobile hamburger button was not found."
        );

        return;
    }


    /*
     * Find the navigation menu.
     */

    const menu =
        document.querySelector(
            "#mobileMenu, " +
            "#navMenu, " +
            ".mobile-menu, " +
            ".nav-menu, " +
            ".navigation-menu, " +
            "nav"
        );

    if (!menu) {

        console.warn(
            "Mobile navigation menu was not found."
        );

        return;
    }


    /*
     * Prevent duplicate initialization.
     */

    if (
        menuButton.dataset.menuInitialized === "true"
    ) {
        return;
    }

    menuButton.dataset.menuInitialized = "true";


    /*
     * Accessibility.
     */

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    menuButton.setAttribute(
        "aria-controls",
        menu.id || "mobileNavigation"
    );


    /*
     * Add an ID if the menu doesn't have one.
     */

    if (!menu.id) {

        menu.id =
            "mobileNavigation";

        menuButton.setAttribute(
            "aria-controls",
            "mobileNavigation"
        );
    }


    /*
     * Open / close menu.
     */

    menuButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            const isOpen =
                menu.classList.contains(
                    "active"
                );

            if (isOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();
            }
        }
    );


    /*
     * Close when clicking a navigation link.
     */

    menu.querySelectorAll(
        "a, button"
    ).forEach(
        item => {

            if (
                item === menuButton
            ) {
                return;
            }

            item.addEventListener(
                "click",
                function() {

                    if (
                        window.innerWidth <= 768
                    ) {

                        closeMobileMenu();
                    }
                }
            );
        }
    );


    /*
     * Close when clicking outside.
     */

    document.addEventListener(
        "click",
        function(event) {

            if (
                window.innerWidth > 768
            ) {
                return;
            }

            if (
                !menu.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {

                closeMobileMenu();
            }
        }
    );


    /*
     * Close with Escape.
     */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                closeMobileMenu();
            }
        }
    );


    /*
     * Close menu when returning to desktop.
     */

    window.addEventListener(
        "resize",
        function() {

            if (
                window.innerWidth > 768
            ) {

                closeMobileMenu();
            }
        }
    );


    function openMobileMenu() {

        menu.classList.add("active");

        menuButton.classList.add("active");

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "menu-open"
        );
    }


    function closeMobileMenu() {

        menu.classList.remove("active");

        menuButton.classList.remove("active");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "menu-open"
        );
    }
}


/* =========================================================
   CARD EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        /*
         * CLOSE MODAL
         */

        const closeButton =
            event.target.closest(
                ".close-modal"
            );

        if (closeButton) {

            event.preventDefault();

            event.stopPropagation();

            closeModal();

            return;
        }


        /*
         * WATCHLIST
         */

        const watchlistButton =
            event.target.closest(
                ".watchlist-btn"
            );

        if (watchlistButton) {

            event.preventDefault();

            event.stopPropagation();

            toggleWatchlist(
                watchlistButton.dataset.id
            );

            return;
        }


        /*
         * MOVIE CARD
         */

        const movieCard =
            event.target.closest(
                ".movie-card"
            );

        if (movieCard) {

            /*
             * Don't open trailer when clicking
             * buttons or links inside card.
             */

            if (
                event.target.closest(
                    "button, a, input, select"
                )
            ) {
                return;
            }

            event.preventDefault();

            const movieId =
                movieCard.dataset.movieId;

            if (movieId) {

                openTrailer(movieId);
            }
        }
    }
);


/* =========================================================
   KEYBOARD — MOVIE CARD
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        const movieCard =
            event.target.closest(
                ".movie-card"
            );

        if (!movieCard) return;

        if (
            event.target.closest(
                ".watchlist-btn"
            )
        ) {
            return;
        }

        event.preventDefault();

        const movieId =
            movieCard.dataset.movieId;

        if (movieId) {

            openTrailer(movieId);
        }
    }
);


/* =========================================================
   ESC — CLOSE MODAL
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeModal();
        }
    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "CineScope UI initialized."
        );


        /*
         * Search
         */

        setupSearch();


        /*
         * Sorting
         */

        setupSorting();


        /*
         * Genres
         */

        setupGenres();


        /*
         * Theme
         */

        setupThemeToggle();


        /*
         * MOBILE HAMBURGER
         */

        setupMobileMenu();


        /*
         * Watchlist
         */

        renderWatchlist();


        /*
         * Movies
         */

        loadPopularMovies();
    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.renderMovies =
    renderMovies;

window.showLoading =
    showLoading;

window.showError =
    showError;

window.loadPopularMovies =
    loadPopularMovies;

window.performSearch =
    performSearch;

window.toggleWatchlist =
    toggleWatchlist;

window.renderWatchlist =
    renderWatchlist;

window.openTrailer =
    openTrailer;

window.closeModal =
    closeModal;

window.setupThemeToggle =
    setupThemeToggle;

window.setupMobileMenu =
    setupMobileMenu;