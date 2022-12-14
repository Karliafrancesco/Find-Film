import { createContext, useEffect, useState } from "react";
import LoadingWrapper from "./LoadingWrapper";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
   const [user, setUser] = useState(null);

   const accessToken = localStorage.getItem("accessToken");

   const fetchUser = () => {
      if (accessToken !== null) {
         fetch("/loggedinuser", {
            method: "GET",
            headers: {
               "Content-type": "application/json",
               Authorization: "Bearer " + accessToken,
            },
         })
            .then((res) => res.json())
            .then((response) => {
               setUser(response.user);
            });
      }
   };

   useEffect(() => {
      fetchUser();
   }, []);

   if (accessToken !== null && user === null) {
      return <LoadingWrapper />;
   }

   return (
      <UserContext.Provider
         value={{
            user,
            reFetch: fetchUser,
         }}
      >
         {children}
      </UserContext.Provider>
   );
};
