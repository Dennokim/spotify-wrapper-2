const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");
const SpotifyWebApi = require("spotify-web-api-node");
const querystring = require("querystring");
const cors = require('cors');
const axios = require('axios');

dotenv.config();

// Spotify API credentials
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_CLIENT_REDIRECT,
});

// Cookie key for storing state
let STATE_KEY = "spotify_auth_state";

// Set up the Express app
const app = express();

// Set up the middleware
app.use(express.static(path.join(__dirname, "client", "build")));
app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Function to generate a random string
const generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

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

  res.redirect(spotifyApi.createAuthorizeURL(scope, state));
});

// Route that Spotify redirects to after the user grants or denies permission
app.get("/callback", async (req, res) => {
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

    try {
      const data = await spotifyApi.authorizationCodeGrant(code);

      // Set the access token and refresh token in the Spotify API object
      spotifyApi.setAccessToken(data.body.access_token);
      spotifyApi.setRefreshToken(data.body.refresh_token);

      // Redirect the user to the profile page
      res.redirect("/profile");
    } catch (error) {
      res.redirect(
        "/#" +
          querystring.stringify({
            error: "invalid_token",
            message: error.message, // Pass the error message to the frontend
          })
      );
    }
  }
});

// Route for getting the access token
app.get("/getAccessToken", (req, res) => {
  // Send the access token as JSON response
  res.json({ access_token: spotifyApi.getAccessToken() });
});

//get users profile and playlists
app.get("/user-profile", async (req, res) => {
  try {
    const userProfile = await spotifyApi.getMe();

    // Now, fetch the user's playlists
    const userPlaylists = await spotifyApi.getUserPlaylists(
      userProfile.body.id
    );
    const totalPlaylists = userPlaylists.body.total;

    // Add the user's playlists and total number of playlists to the user profile
    userProfile.body.playlists = userPlaylists.body.items;
    userProfile.body.totalPlaylists = totalPlaylists;

    res.json(userProfile.body); // Send the updated user profile data as a JSON response to the frontend
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Function to fetch top tracks using SpotifyWebApi
async function fetchTopTracks(range) {
  try {
    const response = await spotifyApi.getMyTopTracks({
      time_range: range,
      limit: 10,
    });

    return response.body.items; // Return the items array from the response
  } catch (error) {
    throw { error: "Failed to fetch top tracks" };
  }
}

// Function to fetch top artists using SpotifyWebApi
async function fetchTopArtists(range) {
  try {
    const response = await spotifyApi.getMyTopArtists({
      time_range: range,
      limit: 10,
    });

    return response.body.items; // Return the items array from the response
  } catch (error) {
    throw { error: "Failed to fetch top artists" };
  }
}

// Function to analyze listening habits and get top albums using SpotifyWebApi
async function analyzeListeningHabits(topTracks) {
  const albumCounts = {};

  for (const track of topTracks) {
    const albumId = track.album.id;
    if (albumCounts[albumId]) {
      albumCounts[albumId]++;
    } else {
      albumCounts[albumId] = 1;
    }
  }

  // Convert the albumCounts object to an array and sort it by frequency
  const sortedAlbums = Object.entries(albumCounts).sort((a, b) => b[1] - a[1]);

  // Fetch detailed information for the top albums
  const topAlbums = await Promise.all(
    sortedAlbums.slice(0, 10).map(async ([albumId]) => {
      try {
        const albumDetailResponse = await fetchAlbumDetails(albumId);
        return albumDetailResponse;
      } catch (error) {
        return null; // Handle errors gracefully
      }
    })
  );

  return topAlbums.filter((album) => album !== null); // Filter out null values
}

async function fetchAlbumDetails(albumId) {
  try {
    const response = await spotifyApi.getAlbum(albumId);
    return response.body;
  } catch (error) {
    console.error("Error fetching album details:", error);
    return null; // Handle errors gracefully
  }
}

// Function to fetch genres for a list of artist IDs using SpotifyWebApi
async function fetchGenresForArtists(artistIds) {
  try {
    const response = await spotifyApi.getArtists(artistIds);
    const artistData = response.body.artists;
    const genres = artistData.map((artist) => artist.genres);
    return genres;
  } catch (error) {
    throw { error: "Failed to fetch artist genres" };
  }
}

app.get("/top-data", async (req, res) => {
  try {
    const range = req.query.range || "short_term";

    // Fetch top tracks and top artists in parallel
    const [topTracksData, topArtists] = await Promise.all([
      fetchTopTracks(range),
      fetchTopArtists(range),
    ]);

    // Analyze listening habits to get top albums
    const sortedAlbums = await analyzeListeningHabits(topTracksData);

    // Fetch detailed information for the top albums
    const topAlbums = [];
    for (const { id } of sortedAlbums.slice(0, 10)) {
      const albumDetailResponse = await fetchAlbumDetails(id);
      if (!albumDetailResponse || albumDetailResponse.error) {
        continue; // Skip if there's an error fetching album details
      }
      topAlbums.push(albumDetailResponse);
    }

    // Extract artist IDs from top tracks and artists
    const topTrackArtistIds = topTracksData.map((track) => track.artists[0].id);
    const topArtistIds = topArtists.map((artist) => artist.id);

    // Combine both sets of artist IDs
    const allArtistIds = [...new Set([...topTrackArtistIds, ...topArtistIds])];

    // Fetch genres for the combined artist IDs
    const artistGenres = await fetchGenresForArtists(allArtistIds);

    // Flatten the array of artist genres
    const allGenres = artistGenres.reduce(
      (acc, genres) => acc.concat(genres),
      []
    );

    // Count the occurrences of each genre
    const genreCounts = {};
    allGenres.forEach((genre) => {
      if (genreCounts[genre]) {
        genreCounts[genre]++;
      } else {
        genreCounts[genre] = 1;
      }
    });

    // Sort the genres by count in descending order
    const sortedGenres = Object.keys(genreCounts).sort(
      (a, b) => genreCounts[b] - genreCounts[a]
    );

    // Get the top 5 genres
    const top5Genres = sortedGenres.slice(0, 5);

    res.json({
      topTracks: topTracksData,
      topArtists,
      topAlbums,
      artistGenres: top5Genres,
    });
  } catch (error) {
    console.error("Error fetching top data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Your API endpoint for handling Spotify search requests
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;

    const options = {
      method: 'GET',
      url: 'https://spotify23.p.rapidapi.com/search/',
      params: {
        q,
        type: 'multi',
        offset: '0',
        limit: '10',
        numberOfTopResults: '5'
      },
      headers: {
        'X-RapidAPI-Key': '4f484c1165msh4c691a3476e9f2bp1746e1jsnb951a6563ff6',
        'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
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