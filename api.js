

const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNDAwYWYxNzk0NGY1NzU4OWE0NDk0MjEwYjE1NjVmZiIsIm5iZiI6MTc4NzE0NDI0MC44ODcsInN1YiI6IjZhODVhODMwMTc4NGQ2YThhMWRhNDk5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.APGo16Yllrsxte2z-jjGmL_Xuglz9qMUsWUnO5E00k4";

"use strict";

const TMDB_BASE_URL =
    "https://api.themoviedb.org/3";


const TMDB_HEADERS = {

    accept: "application/json",

    Authorization:
        `Bearer ${API_TOKEN}`

};


/* =========================================================
   TMDB REQUEST
   ========================================================= */

async function tmdbFetch(endpoint) {

    const response =
        await fetch(
            `${TMDB_BASE_URL}${endpoint}`,
            {
                method: "GET",
                headers: TMDB_HEADERS
            }
        );


    if (!response.ok) {

        let message =
            `TMDB request failed: ${response.status}`;


        try {

            const data =
                await response.json();

            if (data.status_message) {

                message =
                    data.status_message;

            }

        } catch (error) {

            console.error(
                "Unable to read TMDB error:",
                error
            );

        }


        console.error(
            "TMDB error:",
            response.status
        );


        throw new Error(
            message
        );

    }


    return await response.json();

}


/* =========================================================
   POPULAR MOVIES
   ========================================================= */

async function getPopularMovies() {

    return await tmdbFetch(
        "/movie/popular?language=en-US&page=1"
    );

}


/* =========================================================
   TOP RATED MOVIES
   ========================================================= */

async function getTopRatedMovies() {

    return await tmdbFetch(
        "/movie/top_rated?language=en-US&page=1"
    );

}


/* =========================================================
   NOW PLAYING
   ========================================================= */

async function getNowPlayingMovies() {

    return await tmdbFetch(
        "/movie/now_playing?language=en-US&page=1"
    );

}


/* =========================================================
   SEARCH MOVIES
   ========================================================= */

async function searchMovies(query) {

    if (
        !query ||
        !query.trim()
    ) {

        return await getPopularMovies();

    }


    const encodedQuery =
        encodeURIComponent(
            query.trim()
        );


    return await tmdbFetch(
        `/search/movie?query=${encodedQuery}&include_adult=false&language=en-US&page=1`
    );

}


/* =========================================================
   MOVIE DETAILS
   ========================================================= */

async function getMovieDetails(movieId) {

    if (!movieId) {

        throw new Error(
            "Movie ID is required."
        );

    }


    return await tmdbFetch(
        `/movie/${movieId}?language=en-US&append_to_response=videos,credits`
    );

}


/* =========================================================
   MOVIE VIDEOS
   ========================================================= */

async function getMovieVideos(movieId) {

    if (!movieId) {

        throw new Error(
            "Movie ID is required."
        );

    }


    const data =
        await tmdbFetch(
            `/movie/${movieId}/videos?language=en-US`
        );


    return data.results || [];

}


/* =========================================================
   GENRES
   ========================================================= */

async function getGenres() {

    const data =
        await tmdbFetch(
            "/genre/movie/list?language=en-US"
        );


    return data.genres || [];

}


/* =========================================================
   MOVIES BY GENRE
   ========================================================= */

async function getMoviesByGenre(genreId) {

    if (!genreId) {

        throw new Error(
            "Genre ID is required."
        );

    }


    return await tmdbFetch(
        `/discover/movie?with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=1`
    );

}


/* =========================================================
   GLOBAL API FUNCTIONS
   ========================================================= */

window.tmdbFetch =
    tmdbFetch;


window.getPopularMovies =
    getPopularMovies;


window.getTopRatedMovies =
    getTopRatedMovies;


window.getNowPlayingMovies =
    getNowPlayingMovies;


window.searchMovies =
    searchMovies;


window.getMovieDetails =
    getMovieDetails;


window.getMovieVideos =
    getMovieVideos;


window.getGenres =
    getGenres;


window.getMoviesByGenre =
    getMoviesByGenre;