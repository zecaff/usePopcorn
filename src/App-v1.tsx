import {Dispatch, ReactNode, Ref, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import Stars from "./Stars";

const apiKey = '9f600f9f'
const api = 'https://www.omdbapi.com/?apikey=9f600f9f&'

type Movie = {
    imdbID: string,
    Title: string,
    Year: string,
    Poster: string,
};

type Watched = {
    imdbID: string,
    Title: string,
    Year: string,
    Poster: string,
    runtime: number,
    imdbRating: number,
    userRating: number,
    countRatingDecision:number
};

type SelectedMovieType = {
    Title: string, Year: string, Poster: string, Runtime: string, imdbRating: string, Plot: string,
    Released: string, Actors: string, Director: string, Genre: string
}

const average = (arr: number[]) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);


function useMovies(query:string, callBack?:Function): [movies:Movie[], isLoading:boolean, error:string]{
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        callBack?.()
        const controller = new AbortController()
        setError("")
        setIsLoading(true)

        async function getMovies() {
            try {
                const response = await fetch(api + `s=${query}`, {signal: controller.signal})
                if (!response.ok)
                    throw new Error("Something went wrong, try again")

                const data = await response.json()

                if (data.Response === "False")
                    throw new Error("No movies found!")

                setMovies(data.Search)
            } catch (err: any) {
                if (err.name !== "AbortError")
                    setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        getMovies()
        return function () {
            controller.abort();
        }
    }, [query, callBack])

    return [movies, isLoading, error] //could be an object
}

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

function Search({query, setQuery}: { query: string, setQuery: Function }) {
    /*useEffect(function() {
        const el: HTMLInputElement = document.querySelector(".search")!;
        console.log(el);
        el.focus();
    }, [])*/

    //a ref to a DOM element is only useable once it is mounted
    //so we need to use it on a useEffect
    const inputEl = useRef<HTMLInputElement>(null);

    useEffect(function () {
        inputEl.current?.focus()
    }, [])

    function callBack(e:KeyboardEvent){
        if (e.code === "Enter" && document.activeElement !== inputEl.current){
            inputEl.current?.focus()
            setQuery("")
        }
    }
    useKey('keydown', callBack)

    /*useEffect(() => {
        function callBack(e:KeyboardEvent){
            if (e.code === "Enter" && document.activeElement !== inputEl.current){
                inputEl.current?.focus()
                setQuery("")
            }
        }
        document.addEventListener('keydown', callBack);
        return () => document.removeEventListener( 'keydown', callBack);
    }, [setQuery]);*/

    return <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
    />
}

function NavBar({children, query, setQuery}: { children: ReactNode, query: string, setQuery: Function }) {

    return <nav className="nav-bar">
        <Logo/>
        <Search query={query} setQuery={setQuery}/>
        {children}
    </nav>
}

function MovieItem({movie, onSelect}: { movie: Movie, onSelect: Function }) {
    return <li key={movie.imdbID} onClick={() => onSelect(movie.imdbID)}>
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

function WatchedItem({movie, onDeleteWatched}: { movie: Watched, onDeleteWatched: Function }) {
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
            <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
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
                <span>{avgUserRating.toFixed(2)}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime.toFixed(2)} min</span>
            </p>
        </div>
    </div>
}

function ListMovies({movies, onSelect}: { movies: Movie[], onSelect: Function }) {
    return <ul className="list list-movies">
        {movies.map((movie) => <MovieItem onSelect={onSelect} movie={movie}/>)}
    </ul>
}

function ListWatched({watched, onDeleteWatched}: { watched: Watched[], onDeleteWatched: Function }) {
    return <>
        <Summary watched={watched}/>
        <ul className="list">
            {watched.map((movie) => <WatchedItem onDeleteWatched={onDeleteWatched} movie={movie}/>)}
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

function Loader() {
    return <p className='loader'>Loading...</p>
}

function ErrorMsg({msg}: { msg: string }) {
    return <p className='error'>{msg}</p>
}

function useKey(key:string, callback:(e: KeyboardEvent) => any){
    useEffect(() => {
        document.addEventListener('keydown', callback)
        return function () {
            document.removeEventListener('keydown', callback)
        }
    }, [callback, key])
}

function SelectedMovie(
    {selectedId, onBack, onAddWatched, userPreviousRate}:
        { selectedId: string, onBack: Function, onAddWatched: Function, userPreviousRate: number }
) {
    const [movie, setMovie] = useState<SelectedMovieType | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [userRating, setUserRating] = useState(userPreviousRate)
    const {
        Title: title = undefined,
        Year: year = undefined,
        Poster: poster = undefined,
        Runtime: runtime = undefined,
        imdbRating = undefined,
        Plot: plot = undefined,
        Released: released = undefined,
        Actors: actors = undefined,
        Director: director = undefined,
        Genre: genre = undefined
    } = movie ? movie : {}
    const nRates= useRef(0)

    function handleAddWatched() {
        const newWatched = {
            imdbID: selectedId,
            Title: title,
            Year: year,
            Poster: poster,
            runtime: +(runtime?.split(" ").at(0)!),
            imdbRating: imdbRating,
            userRating: userRating,
            countRatingDecision: nRates.current
        };

        onAddWatched(newWatched)
        onBack(null)
    }

    function handleRate(rate:number){
        ++nRates.current
        setUserRating(rate)
    }

    //useEffect alternative
    /*useEffect(() => {
        if(userRating)
            ++nRates.current
    }, [userRating]);*/


    useEffect(() => {
        async function getMovieDetails() {
            setIsLoading(true)
            const res = await fetch(api + `i=${selectedId}`)
            const data = await res.json();
            setMovie(data)
            setIsLoading(false)
        }

        getMovieDetails()
    }, [selectedId])

    useEffect(() => {
        document.title = title || 'usePopcorn'
        return function () {
            document.title = 'usePopcorn'
        }
    }, [title]);


    function callBack(e: KeyboardEvent) {
        if (e.code === 'Escape')
            onBack(null)
    }
    useKey('Escape', callBack)
    /*useEffect(() => {
        function callBack

        document.addEventListener('keydown', callBack)
        return function () {
            document.removeEventListener('keydown', callBack)
        }
    }, [onBack])*/

    return <div className="details">
        {isLoading ? <Loader/> :
            <>
                <header>
                    <button className="btn-back" onClick={() => onBack(null)}>
                        &larr;
                    </button>
                    <img src={poster} alt="poster"/>
                    <div className="details-overview">
                        <h2>{title}</h2>
                        <p>
                            {released} &bull; {runtime}
                        </p>
                        <p>{genre}</p>
                        <p>
                            <span>⭐</span>
                            {imdbRating} IMDb Rating
                        </p>
                    </div>
                </header>

                <section>
                    <div className="rating">
                        <Stars defaultRate={userPreviousRate} onSetRating={(rate:number) => handleRate(rate)} maxRate={10} size={24}/>
                        {userPreviousRate === 0 && userRating > 0 &&
                            <button className="btn-add" onClick={handleAddWatched}>+ Add to list</button>
                        }
                        {userPreviousRate !== 0 && userPreviousRate !== userRating &&
                            <button className="btn-add" onClick={handleAddWatched}>Change your rate</button>
                        }
                    </div>
                    <p>
                        <em>{plot}</em>
                    </p>
                    <p>Starring {actors}</p>
                    <p>Directed by {director}</p>
                </section>
            </>
        }
    </div>
}

function useLocalStorageState<T>(initValue:T, key:string): [T, Dispatch<SetStateAction<T>>]{
    const [state, setState ] = useState<T>(function () {
        const storeValue = localStorage.getItem(key)
        return storeValue ? JSON.parse(storeValue) : initValue
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state))
    }, [state, key]);

    return [state, setState]
}

export default function App() {
    const [query, setQuery] = useState("");
    //usecallback is something i searched, its learned later in the course
    const [movies, isLoading, error ] = useMovies(query, useCallback(() => setSelectedId(null), []))
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [watched, setWatched] = useLocalStorageState<Watched[]>([],"watched")

    //we should do useState<Watched[]>(JSON.parse(localStorage.getItem("watched"));
    //because, even tho react would ignore the value on re-render, react woulçd still call
    //JSON.parse(localStorage.getItem("watched") every time on re-render which is wasted computation
    //instead we pass a callback function when the init value depends of a compputation

    const selectedUserRate = watched.find(watched => watched.imdbID === selectedId)?.userRating

    //because we are setting a state inside the render logic
    // react will keep re-rendering this component, creating an infinite loop
    //fetch(api+'s=interstellar').then(res => res.json()).then(data => console.log(data))

    function handleSelectMovie(id: string | null) {
        return id === selectedId ? setSelectedId(null) : setSelectedId(id)
    }

    function handleAddWatched(movie: Watched) {
        const filteredWatched = watched.filter(watched => watched.imdbID !== movie.imdbID)
        setWatched([...filteredWatched, movie])
        //we let the useeffect do this next operation, by making that useffect depend on watched
        //localStorage.setItem('watched', JSON.stringify([...filteredWatched, movie]))
    }

    function handleDeleteWatched(movieId: string) {
        const filteredWatched = watched.filter(watched => watched.imdbID !== movieId)
        setWatched([...filteredWatched])
    }

    //this should had been an eventhandler and not an useeffect, because its
    // something not done on mount, init render, but when an event happens
    // on the search bar, but we did this for learning of useeffects
    /*useEffect(() => {
        const controller = new AbortController()
        setError("")
        setIsLoading(true)

        async function getMovies() {
            try {
                const response = await fetch(api + `s=${query}`, {signal: controller.signal})
                if (!response.ok)
                    throw new Error("Something went wrong, try again")

                const data = await response.json()

                if (data.Response === "False")
                    throw new Error("No movies found!")

                setMovies(data.Search)
            } catch (err: any) {
                if (err.name !== "AbortError")
                    setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        getMovies()
        return function () {
            controller.abort();
        }
    }, [query])*/

    useEffect(() => {
        localStorage.setItem('watched', JSON.stringify(watched))
    }, [watched])

    return (
        <>
            <NavBar query={query} setQuery={setQuery}> <NResults moviesFound={movies.length}/></NavBar>
            <Main>
                <ListBox>
                    {!isLoading && !error && <ListMovies onSelect={handleSelectMovie} movies={movies}/>}
                    {error && <ErrorMsg msg={error}/>}
                    {isLoading && <Loader/>}
                </ListBox>
                <ListBox>
                    {selectedId ?
                        <SelectedMovie
                            onAddWatched={handleAddWatched}
                            onBack={handleSelectMovie}
                            selectedId={selectedId}
                            userPreviousRate={selectedUserRate ? selectedUserRate : 0}
                        /> :
                        <ListWatched onDeleteWatched={handleDeleteWatched} watched={watched}/>}
                </ListBox>
            </Main>
        </>
    );
}
