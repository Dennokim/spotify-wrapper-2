const express = require("express");
const request = require("request");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// Spotify API credentials
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_CLIENT_REDIRECT;

// Setting up a random state random generator
const generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Cookie key for storing state
let STATE_KEY = "spotify_auth_state";

// Set up the Express app
const app = express();

// Create an object to store tokens
let tokenData = {
  access_token: "",
  refresh_token: "",
};

// Set up the middleware
app.use(express.static(path.join(__dirname, "client", "build")));
app.use(cors());
app.use(cookieParser());

// Route for initiating the Spotify login process
app.get("/login", (req, res) => {
  let state = generateRandomString(16);
  res.cookie(STATE_KEY, state);

  let scope = [
    "ugc-image-upload",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "app-remote-control",
    "user-read-email",
    "user-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-modify-private",
    "user-library-modify",
    "user-library-read",
    "user-top-read",
    "user-read-playback-position",
    "user-read-recently-played",
    "user-follow-read",
    "user-follow-modify",
  ];

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope.join(" "),
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

// Route that Spotify redirects to after the user grants or denies permission
app.get("/callback", (req, res) => {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(STATE_KEY);

    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Store the access token and refresh token in the tokenData object
        tokenData.access_token = body.access_token;
        tokenData.refresh_token = body.refresh_token;

        // Redirect the user to the profile page
        res.redirect("/profile");
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

// Route for getting the access token
app.get("/getAccessToken", (req, res) => {
  // Send the access token as JSON response
  res.json({ access_token: tokenData.access_token });
});

app.get("/top-tracks", async (req, res) => {
  const range = req.query.range || "short_term"; // Default to short_term if range is not provided

  try {
    // Use the access token stored in tokenData
    const authOptions = {
      url: "https://api.spotify.com/v1/me/top/tracks",
      qs: {
        time_range: range,
        limit: 10, // Limit to 10 tracks, adjust as needed
      },
      headers: {
        Authorization: "Bearer " + tokenData.access_token,
      },
      json: true,
    };

    // Make a GET request to the Spotify API to fetch top tracks
    request.get(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const topTracks = body.items;
        res.json(topTracks); // Send the top tracks as a JSON response to the frontend
      } else {
        res
          .status(response.statusCode)
          .send({ error: "Failed to fetch top tracks" });
      }
    });
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Handle all other routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
