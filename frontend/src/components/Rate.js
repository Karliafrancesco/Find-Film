import { useState, useContext, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import styled from "styled-components";

import { UserContext } from "./UserContext";
import LoadingWrapper from "./LoadingWrapper";

const Rate = ({ movie_id }) => {
   const { user } = useContext(UserContext);

   const [rate, setRate] = useState(0);
   const [ratings, setRatings] = useState("");
   const [status, setStatus] = useState("loading");

   const handleRate = async (e, givenRating) => {
      setRate(givenRating);

      fetch("/rate", {
         method: "POST",
         body: JSON.stringify({
            movie_id: movie_id,
            id: user._id,
            rating: givenRating,
         }),
         headers: {
            "Content-type": "application/json",
         },
      })
         .then((res) => res.json())
         .then((response) => {
            console.log(response);
            re();
         });
   };

   let sum = 0;
   //calculates the index as a rating the user clicked on
   for (let index = 0; index < ratings.length; index++) {
      sum += ratings[index].rating / ratings.length;
   }
   sum = sum.toFixed(2);

   const re = () => {
      fetch(`/rate/${movie_id}`)
         .then((res) => res.json())
         .then((data) => {
            setRatings(data.data);

            setStatus("idle");
         })
         .catch((err) => {
            setStatus("error");
         });
   };

   //updates review
   useEffect(() => {
      re();
   }, [sum]);

   if (status === "loading") {
      return <LoadingWrapper />;
   }

   return (
      <Contain>
         {[...Array(5)].map((item, index) => {
            const givenRating = index + 1;
            return (
               <label key={index}>
                  <Radio
                     type="radio"
                     value={givenRating}
                     onChange={(e) => {
                        handleRate(e, givenRating);
                        alert(
                           `Are you sure you want to give ${givenRating} stars ?`
                        );
                     }}
                  />
                  {user !== null ? (
                     <Rating>
                        <FaStar
                           color={
                              givenRating < rate || givenRating === rate
                                 ? "gold"
                                 : "gray"
                           }
                        />
                     </Rating>
                  ) : (
                     <div></div>
                  )}
               </label>
            );
         })}
         <AvgRating style={{ color: "white" }}>
            {sum} <FaStar color={"gold"} /> rating
         </AvgRating>
      </Contain>
   );
};

const Contain = styled.div`
   display: flex;
   align-items: center;
   font-size: 20px;
`;
const Radio = styled.input`
   display: none;
`;
const Rating = styled.div`
   cursor: pointer;
`;

const AvgRating = styled.div`
   padding-left: 10px;
`;

export default Rate;
