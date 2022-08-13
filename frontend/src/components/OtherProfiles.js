import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "./UserContext";
import { Link } from "react-router-dom";
import styled from "styled-components";
import LoadingWrapper from "./LoadingWrapper";

const OtherProfiles = () => {
   const { user } = useContext(UserContext);
   const [profile, setProfile] = useState("");
   const [status, setStatus] = useState("loading");
   const [activeTab, setActiveTab] = useState("favorites");

   let nav = useNavigate();

   let favMovies = profile.favorites;
   let follower = profile.followers;
   let following = profile.following;

   const { id } = useParams();

   let followers = user !== null ? user.following : null;

   const isFound =
      user !== null
         ? followers.some((follower) => {
              return follower.id === id;
           })
         : null;

   const [favorited, setFavorited] = useState(isFound);

   //fetch to get info on specific user from profile
   useEffect(() => {
      fetch(`/user/${id}`)
         .then((res) => res.json())
         .then((data) => {
            setProfile(data.data);
            console.log(data.data);
            setStatus("idle");
         })
         .catch((err) => {
            setStatus("error");
         });
   }, []);

   // function to add follower to specific user document
   const handleFollow = (e) => {
      e.preventDefault();
      fetch(`/follow/${id}`, {
         method: "PATCH",
         body: JSON.stringify({
            username: user.username,
            _id: user._id,
            profile: profile.username,
            author: profile._id,
         }),
         headers: {
            "Content-type": "application/json",
         },
      })
         .then((res) => res.json())
         .then((response) => {
            setFavorited(true);
            console.log(response);
         });
   };

   const handleUnfollow = (e) => {
      e.preventDefault();
      fetch("/unfollow", {
         method: "PATCH",
         body: JSON.stringify({
            id: user._id,
            otherId: profile._id,
         }),
         headers: {
            "Content-type": "application/json",
         },
      })
         .then((res) => res.json())
         .then((response) => {
            setFavorited(false);
            console.log(response);
         });
   };

   if (status === "loading") {
      return <LoadingWrapper />;
   }

   return (
      <Container>
         {user._id !== profile._id ? (
            <FollowAndName>
               <Name>{profile.name}</Name>
               {user !== null && favorited === false ? (
                  <FollowButton onClick={(e) => handleFollow(e)}>
                     Follow
                  </FollowButton>
               ) : (
                  <FollowButton onClick={(e) => handleUnfollow(e)}>
                     Unfollow
                  </FollowButton>
               )}
            </FollowAndName>
         ) : (
            nav(`/profile/${user._id}`)
         )}
         <Wrapper>
            <Buttons>
               <Tab autoFocus onClick={() => setActiveTab("favorites")}>
                  Favorite Movies
               </Tab>
               <Tab onClick={() => setActiveTab("followers")}>Followers</Tab>
               <Tab onClick={() => setActiveTab("following")}>Following</Tab>
            </Buttons>
            {activeTab === "favorites" && (
               <div>
                  {favMovies.length > 0 ? (
                     <Wrap>
                        {favMovies.map((m) => {
                           return (
                              <WrapFav>
                                 <LinkTo to={`/movie/${m.movie_id}`}>
                                    <MovieImage
                                       src={`https://image.tmdb.org/t/p/w500${m.image}`}
                                    />
                                    <MovieTitle>{m.title}</MovieTitle>
                                 </LinkTo>
                              </WrapFav>
                           );
                        })}
                     </Wrap>
                  ) : (
                     <None>No Followers</None>
                  )}
               </div>
            )}
            {activeTab === "followers" && (
               <div>
                  {follower.length > 0 ? (
                     <Wrap>
                        {follower.map((follower) => {
                           return (
                              <FollowerUsername>
                                 {follower.username}
                              </FollowerUsername>
                           );
                        })}
                     </Wrap>
                  ) : (
                     <None>No Followers</None>
                  )}
               </div>
            )}
            {activeTab === "following" && (
               <div>
                  {following.length > 0 ? (
                     <Wrap>
                        {following.map((follow) => {
                           return (
                              <FollowerUsername>
                                 {follow.username}
                              </FollowerUsername>
                           );
                        })}
                     </Wrap>
                  ) : (
                     <None>None</None>
                  )}
               </div>
            )}
         </Wrapper>
      </Container>
   );
};

const Container = styled.div`
   width: 100%;
   background-color: black; ;
`;

const FollowAndName = styled.div`
   display: flex;
   align-items: center;
   margin-top: 50px;
   gap: 20px;
`;

const Tab = styled.button`
   font-size: 20px;
   background: none;
   border: none;
   color: white;
   cursor: pointer;

   &:hover {
      color: gold;
      border-bottom: 1px solid gold;
   }

   &.active {
      color: gold;
   }

   &:focus {
      border: none;
      border-bottom: 1px solid gold;
      color: gold;
   }
`;

const Buttons = styled.button`
   display: flex;
   justify-content: center;
   background-color: #2b2b2b;
   border: none;
   gap: 20px;
   margin-bottom: 30px;
`;

const Wrap = styled.div`
   display: flex;
   flex-wrap: wrap;
   justify-content: center;
`;

const Wrapper = styled.div`
   margin-left: 100px;
   margin-top: 50px;
   background: #2b2b2b;
   margin-right: 100px;
   padding: 20px;
   display: flex;
   flex-direction: column;
`;

const WrapFav = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   padding: 20px 20px;
   flex-wrap: wrap;
   max-width: 200px;
`;

const Name = styled.div`
   color: white;
   font-size: 25px;
   margin-left: 100px;
`;

const MovieTitle = styled.div`
   color: white;
   display: flex;
   justify-content: center;
`;

const MovieImage = styled.img`
   height: 300px;
   width: 200px;
   padding-bottom: 5px;
`;

const FollowButton = styled.button`
   border: none;
   font-weight: bold;
   background-color: gold;
   color: black;
   padding: 10px;
   border-radius: 10px;
`;

const LinkTo = styled(Link)`
   text-decoration: none;
`;

const FollowerUsername = styled.div`
   color: white;
   display: flex;
   justify-content: center;
`;

const None = styled.div`
   display: flex;
   justify-content: center;
   font-size: large;
   color: white;
   text-decoration: underline;
   opacity: 0.5;
`;

export default OtherProfiles;
