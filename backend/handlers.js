"use strict";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
const { MONGO_URI } = process.env;
const client_key = process.env.BACK_KEY;

require("dotenv").config();

const options = {
   useNewUrlParser: true,
   useUnifiedTopology: true,
};

const fetch = (...args) =>
   import("node-fetch").then(({ default: fetch }) => fetch(...args));

const authenticateToken = (req, res, next) => {
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1];
   if (token == null) return res.sendStatus(401);

   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
   });
};

//-----------------------------------------------------------
//-----------------------------------------------------------

const generateAccessToken = (user) => {
   return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
};

//-----------------------------------------------------------
//-----------------------------------------------------------

const handleSignUp = async (req, res) => {
   const client = new MongoClient(MONGO_URI, options);
   await client.connect();

   try {
      const db = client.db("db-name");

      //variable to check users collection and see if username exists
      const exist = await db
         .collection("users")
         .findOne({ username: req.body.username });

      if (exist) {
         return res
            .status(409)
            .json({ status: 409, message: "User already exists" });
      }

      //variable to hide users password when sent to the database
      const hashed = await bcrypt.hash(req.body.password, 10);

      //inserting new info in users collection
      await db.collection("users").insertOne({
         username: req.body.username,
         name: req.body.name,
         lastName: req.body.lastName,
         password: hashed,
      });

      res.status(200).json({ status: 200, message: "User Created" });
   } catch (e) {
      console.error("Error signing up:", e);
      return res.status(500).json({ status: 500, message: e.name });
   } finally {
      client.close();
   }
};

//-----------------------------------------------------------
//-----------------------------------------------------------

const handleSignIn = async (req, res) => {
   const client = new MongoClient(MONGO_URI, options);

   // Extract the sign in details from the request.
   const { username, password } = req.body;

   // If either value is missing, respond with a bad request.
   if (!username || !password) {
      return res.status(400).json({
         status: 400,
         message: "Missing data",
         data: req.body,
      });
   }

   try {
      await client.connect();
      const users = client.db("db-name").collection("users");

      const user = await users.findOne({ username });

      // Verify that the user attempting to sign in exists.
      if (!user) {
         return res.status(404).json({
            status: 404,
            message: "No user found",
            data: { username },
         });
      }

      // Verify that the password entered is correct.
      const verify = await bcrypt.compare(password, user.password);

      if (!verify) {
         return res.status(401).json({
            status: 401,
            message: "Incorrect password",
            data: { username },
         });
      } else {
         // Remove the user's password from the response.
         const clone = { ...user };
         delete clone.password;

         return res.status(200).json({ status: 200, data: { user: clone } });
      }
   } catch (e) {
      console.error("Error signing in:", e);
      return res.status(500).json({ status: 500, message: e.name });
   } finally {
      client.close();
   }
};

//-----------------------------------------------------------
//-----------------------------------------------------------

const handleMoviesSearch = async (req, res) => {
   try {
      let response = await fetch(
         `https://api.themoviedb.org/3/search/movie?api_key=${client_key}&query=${req.query.search}`
      );

      const data = await response.json();
      console.log(data);
      res.status(200).json({ status: 200, data });
   } catch (err) {
      return err.error ? JSON.parse(err.error) : err;
   }
};

//-----------------------------------------------------------
//-----------------------------------------------------------

const handleUsers = async (req, res) => {
   const client = new MongoClient(MONGO_URI, options);
   await client.connect();

   try {
      const db = client.db("db-name");
      //find all users in users collection and converts it to array
      const users = await db.collection("users").find().toArray();

      if (users) {
         //to delete password from each user so its not shown for security
         users.forEach((obj) => {
            delete obj["password"];
         });
         return res.status(200).json({ status: 200, users });
      } else {
         return res
            .status(404)
            .json({ status: 404, message: "No users found" });
      }
   } catch (e) {
      console.error("Error signing in:", e);
      return res.status(500).json({ status: 500, message: e.name });
   } finally {
      client.close();
   }
};

//-----------------------------------------------------------
//-----------------------------------------------------------

//-----------------------------------------------------------
//-----------------------------------------------------------

const handleLoggedUser = async (req, res) => {
   const client = new MongoClient(MONGO_URI, options);
   await client.connect();

   try {
      const db = client.db("db-name");
      //find all users in users collection and converts it to array
      const users = await db.collection("users").find().toArray();
      const result = users.filter((user) => user.username === req.user.name);

      // if (users) {
      //    //to delete password from each user so its not shown for security
      //    users.forEach((obj) => {
      //       delete obj["password"];
      //    });
      //    return
      res.status(200).json({ status: 200, user: result, message: "logged" });
      // } else {
      //    return res
      //       .status(404)
      //       .json({ status: 404, message: "No users found" });
      // }
   } catch (e) {
      console.error("Error signing in:", e);
      return res.status(500).json({ status: 500, message: e.name });
   } finally {
      client.close();
   }
};

//-----------------------------------------------------------
//-----------------------------------------------------------

const handlePostReview = async (req, res) => {
   const client = new MongoClient(MONGO_URI, options);
   await client.connect();

   const { movie_id } = req.body;

   if (!review) {
      return res.status(400).json({
         status: 400,
         message: "Missing data",
         data: req.body,
      });
   }

   try {
      const db = client.db("db-name");

      await db.collection("reviews").insertOne({
         review: req.body.review,
         movie_id: movie_id,
      });
   } catch (e) {
      console.error("Error signing in:", e);
      return res.status(500).json({ status: 500, message: e.name });
   } finally {
      client.close();
   }
};

//-----------------------------------------------------------
//-----------------------------------------------------------

const handleLogin = async (req, res) => {
   const username = req.body.username;
   const user = { name: username };

   const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
   res.json({ accessToken: accessToken });

   const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
   return res.status(200).json({
      message: "Success",
      token: accessToken,
      refreshToken: refreshToken,
   });
};

//-----------------------------------------------------------
//-----------------------------------------------------------

module.exports = {
   handleSignUp,
   handleSignIn,
   handleMoviesSearch,
   handleUsers,
   handlePostReview,
   handleLogin,
   authenticateToken,
   handleLoggedUser,
};
