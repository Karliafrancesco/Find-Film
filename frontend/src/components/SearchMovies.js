import React, { useContext, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { MoviesContext } from "./MoviesContext";

const SearchMovies = () => {
   const [query, setQuery] = useState("");

   const { movies, setMovies } = useContext(MoviesContext);

   const searchMovies = async (e) => {
      e.preventDefault();

      const url = `/moviessearch/?search=${query}`;

      try {
         const res = await fetch(url);
         const data = await res.json();
         setMovies(data.data.results);
      } catch (err) {
         console.log(err);
      }
   };

   return (
      <Container>
         <SearchForm onSubmit={searchMovies}>
            <SearchInput
               type="text"
               name="query"
               placeholder="Search for movie here"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
            />
            <SearchButton type="submit">Search</SearchButton>
         </SearchForm>

         {movies === undefined ? (
            <PleaseSearch>
               <div
                  style={{
                     color: "white",
                  }}
               >
                  Please search for a movie.
               </div>
            </PleaseSearch>
         ) : (
            <Wrap>
               {movies.map((movie) => (
                  <LinkTo key={movie.id} to={`/movie/${movie.id}`}>
                     <Wrapper>
                        <Img
                           src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        />
                        <Title>{movie.title}</Title>
                     </Wrapper>
                  </LinkTo>
               ))}
            </Wrap>
         )}
      </Container>
   );
};

const Wrap = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: 70px;
   padding-right: 50px;
   padding-left: 50px;
   display: flex;
   justify-content: center;
   background-color: black;
`;

const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 15px;
   padding-bottom: 10px;
   width: 250px;
   height: 400px;
   margin-top: 20px;
   position: relative;
`;

const Container = styled.div`
   width: 100%;
   height: 1000px;
   background: black;
`;

const SearchForm = styled.form`
   display: flex;
   align-items: center;
   justify-content: center;
   margin-top: 75px;
   margin-bottom: 75px;
   gap: 20px;
`;

const SearchInput = styled.input`
   width: 350px;
   height: 35px;
   border-radius: 3px;
   font-size: 20px;
   text-decoration: none;
   padding-left: 20px;
`;

const SearchButton = styled.button`
   cursor: pointer;
   border: none;
   height: 35px;
   width: 75px;
   text-align: center;
   background-color: gold;
   border-radius: 3px;
`;

const Img = styled.img`
   height: 350px;
   width: 250px;
   box-shadow: 1px 1px 4px #888888;

   &:hover {
      box-shadow: 1px 1px 2px 2px #888888;
   }
`;

const Title = styled.div`
   color: white;

   &:hover {
      color: gold;
   }
`;

const LinkTo = styled(Link)`
   text-decoration: none;
`;

const PleaseSearch = styled.div`
   color: white;
   display: flex;
   justify-content: center;
`;

export default SearchMovies;
