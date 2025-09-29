import {ReactNode, useState} from "react";

const tempMovieData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster:
            "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    },
    {
        imdbID: "tt0133093",
        Title: "The Matrix",
        Year: "1999",
        Poster:
            "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    },
    {
        imdbID: "tt6751668",
        Title: "Parasite",
        Year: "2019",
        Poster:
            "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
    },
];

const tempWatchedData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster:
            "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        runtime: 148,
        imdbRating: 8.8,
        userRating: 10,
    },
    {
        imdbID: "tt0088763",
        Title: "Back to the Future",
        Year: "1985",
        Poster:
            "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        runtime: 116,
        imdbRating: 8.5,
        userRating: 9,
    },
];

type Movie = typeof tempMovieData[0]
type Watched = typeof tempWatchedData[0]

const average = (arr: number[]) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Logo() {
    return <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>
}

function NResults({moviesFound}: { moviesFound: number }) {
    return <p className="num-results">
        Found <strong>{moviesFound}</strong> results
    </p>
}

function NavBar({children}: { children: ReactNode }) {
    const [query, setQuery] = useState("");

    return <nav className="nav-bar">
        <Logo/>
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
        {children}
    </nav>
}

function MovieItem({movie}: { movie: Movie }) {
    return <li key={movie.imdbID}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
            </p>
        </div>
    </li>
}

function WatchedItem({movie}: { movie: Watched }) {
    return <li key={movie.imdbID}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
            </p>
        </div>
    </li>
}

function Summary({watched}: { watched: Watched[] }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return <div className="summary">
        <h2>Movies you watched</h2>
        <div>
            <p>
                <span>#️⃣</span>
                <span>{watched.length} movies</span>
            </p>
            <p>
                <span>⭐️</span>
                <span>{avgImdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime} min</span>
            </p>
        </div>
    </div>
}

function ListMovies({movies}: { movies: Movie[] }) {
    return <ul className="list">
        {movies.map((movie) => <MovieItem movie={movie}/>)}
    </ul>
}

function ListWatched({watched}: { watched: Watched[] }) {
    return <>
        <Summary watched={watched}/>
        <ul className="list">
            {watched.map((movie) => <WatchedItem movie={movie}/>)}
        </ul>
    </>
}

function ListBox({children}: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    return <div className="box">
        <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
            {isOpen ? "–" : "+"}
        </button>
        {isOpen && children}
    </div>
}

function Main({children}: { children: ReactNode }) {
    return <main className="main">{children}</main>
}

export default function App() {
    const [movies, setMovies] = useState(tempMovieData);
    const [watched, setWatched] = useState(tempWatchedData);

    return (
        <>
            <NavBar> <NResults moviesFound={movies.length}/></NavBar>
            <Main>
                <ListBox>
                    <ListMovies movies={movies}/>
                </ListBox>
                <ListBox>
                    <ListWatched watched={watched}/>
                </ListBox>
            </Main>
        </>
    );
}
