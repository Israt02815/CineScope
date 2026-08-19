// ==========================================
// CineScope - Main Application
// ==========================================

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const themeToggle =
    document.getElementById("themeToggle");

const sortSelect =
    document.getElementById("sortSelect");


// Store currently displayed movies
let currentMovies = [];


// ==========================================
// LOAD TRENDING MOVIES
// ==========================================

async function loadTrendingMovies() {

    showLoading();

    try {

        const movies =
            await fetchTrendingMovies();

        currentMovies = movies;

        displayMovies(currentMovies);

    } catch (error) {

        console.error(error);

        showError(
            "We couldn't load movies right now. Please check your API connection."
        );
    }
}


// ==========================================
// SEARCH MOVIES
// ==========================================

async function performSearch() {

    const query =
        searchInput.value.trim();


    // If search is empty
    if (!query) {

        document
            .getElementById("movieSectionTitle")
            .textContent =
                "Trending Movies";

        loadTrendingMovies();

        return;
    }


    showLoading();


    try {

        const data =
            await searchMovies(query);


        currentMovies =
            data.results;


        document
            .getElementById("movieSectionTitle")
            .textContent =
                `Search results for "${query}"`;


        displayMovies(
            currentMovies
        );


    } catch (error) {

        console.error(error);

        showError(
            "We couldn't complete your search. Please try again."
        );
    }
}


// Search button
searchBtn.addEventListener(
    "click",
    performSearch
);


// Press Enter to search
searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            performSearch();

        }

    }
);


// ==========================================
// SORT MOVIES
// ==========================================

sortSelect.addEventListener(
    "change",
    () => {

        const sortedMovies =
            [...currentMovies];


        const sortType =
            sortSelect.value;


        // Most popular
        if (
            sortType ===
            "popularity"
        ) {

            sortedMovies.sort(
                (a, b) =>
                    b.popularity -
                    a.popularity
            );
        }


        // Highest rated
        if (
            sortType ===
            "rating"
        ) {

            sortedMovies.sort(
                (a, b) =>
                    b.vote_average -
                    a.vote_average
            );
        }


        // Newest
        if (
            sortType ===
            "newest"
        ) {

            sortedMovies.sort(
                (a, b) =>
                    new Date(
                        b.release_date ||
                        "1900-01-01"
                    ) -
                    new Date(
                        a.release_date ||
                        "1900-01-01"
                    )
            );
        }


        displayMovies(
            sortedMovies
        );
    }
);


// ==========================================
// DARK / LIGHT MODE
// ==========================================

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        themeToggle.textContent =
            isDark
                ? "☀️"
                : "🌙";


        localStorage.setItem(
            "cinescopeTheme",
            isDark
                ? "dark"
                : "light"
        );
    }
);


// ==========================================
// LOAD SAVED THEME
// ==========================================

const savedTheme =
    localStorage.getItem(
        "cinescopeTheme"
    );


if (
    savedTheme ===
    "dark"
) {

    document.body.classList.add(
        "dark-mode"
    );

    themeToggle.textContent =
        "☀️";
}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

async function initializeApp() {

    // Load trending movies
    await loadTrendingMovies();


    // Load genres
    try {

        const genres =
            await fetchGenres();

        displayGenres(
            genres
        );

    } catch (error) {

        console.error(
            "Could not load genres:",
            error
        );
    }


    // Load saved watchlist
    displayWatchlist();
}


// Start CineScope
initializeApp();