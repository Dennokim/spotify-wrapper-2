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

//get users profile and playlists
app.get("/user-profile", async (req, res) => {
  try {
    // Use the access token stored in tokenData
    const authOptions = {
      url: "https://api.spotify.com/v1/me",
      headers: {
        Authorization: "Bearer " + tokenData.access_token,
      },
      json: true,
    };

    // Make a GET request to the Spotify API to fetch user profile data
    request.get(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const userProfile = body;
        
        // Now, fetch the user's playlists
        const playlistsOptions = {
          url: "https://api.spotify.com/v1/me/playlists",
          headers: {
            Authorization: "Bearer " + tokenData.access_token,
          },
          json: true,
        };

        // Make a GET request to the Spotify API to fetch user's playlists
        request.get(playlistsOptions, (error, response, playlistsBody) => {
          if (!error && response.statusCode === 200) {
            const userPlaylists = playlistsBody.items;
            const totalPlaylists = playlistsBody.total;
            
            // Add the user's playlists and total number of playlists to the user profile
            userProfile.playlists = userPlaylists;
            userProfile.totalPlaylists = totalPlaylists;
            
            res.json(userProfile); // Send the updated user profile data as a JSON response to the frontend
          } else {
            res.status(response.statusCode).send({ error: "Failed to fetch user playlists" });
          }
        });
      } else {
        res.status(response.statusCode).send({ error: "Failed to fetch user profile" });
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});


// Function to fetch top tracks
function fetchTopTracks(range) {
  return new Promise((resolve, reject) => {
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

    request.get(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject({ error: "Failed to fetch top tracks" });
      }
    });
  });
}

// Function to fetch top artists
function fetchTopArtists(range) {
  return new Promise((resolve, reject) => {
    const authOptions = {
      url: "https://api.spotify.com/v1/me/top/artists",
      qs: {
        time_range: range,
        limit: 10, // Limit to 10 artists, adjust as needed
      },
      headers: {
        Authorization: "Bearer " + tokenData.access_token,
      },
      json: true,
    };

    request.get(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject({ error: "Failed to fetch top artists" });
      }
    });
  });
}

// Function to analyze listening habits and get top albums
function analyzeListeningHabits(topTracks) {
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

  return sortedAlbums;
}

// Function to fetch album details by ID
function fetchAlbumDetails(albumId) {
  return new Promise((resolve, reject) => {
    const authOptions = {
      url: `https://api.spotify.com/v1/albums/${albumId}`,
      headers: {
        Authorization: "Bearer " + tokenData.access_token,
      },
      json: true,
    };

    request.get(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject({ error: "Failed to fetch album details" });
      }
    });
  });
}

// Function to fetch genres for a list of artist IDs
function fetchGenresForArtists(artistIds) {
  return new Promise((resolve, reject) => {
    const authOptions = {
      url: "https://api.spotify.com/v1/artists",
      qs: {
        ids: artistIds.join(","), // Comma-separated list of artist IDs
      },
      headers: {
        Authorization: "Bearer " + tokenData.access_token,
      },
      json: true,
    };

    request.get(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const artistData = body.artists;
        const genres = artistData.map((artist) => artist.genres);
        resolve(genres);
      } else {
        reject({ error: "Failed to fetch artist genres" });
      }
    });
  });
}

// Route to get the user's top tracks, artists, and albums
app.get("/top-data", async (req, res) => {
  try {
    const range = req.query.range || "short_term"; // Default to short_term if range is not provided

    // Fetch top tracks, artists, and albums in parallel
    const [topTracks, topArtists] = await Promise.all([
      fetchTopTracks(range),
      fetchTopArtists(range),
    ]);

    // Analyze listening habits to get top albums
    const sortedAlbums = analyzeListeningHabits(topTracks.items);

    // Fetch detailed information for the top albums
    const topAlbums = [];
    for (const [albumId] of sortedAlbums.slice(0, 10)) {
      const albumDetailResponse = await fetchAlbumDetails(albumId);
      if (!albumDetailResponse || albumDetailResponse.error) {
        continue; // Skip if there's an error fetching album details
      }
      topAlbums.push(albumDetailResponse);
    }

    // Extract artist IDs from top tracks and artists
    const topTrackArtistIds = topTracks.items.map(
      (track) => track.artists[0].id
    );
    const topArtistIds = topArtists.items.map((artist) => artist.id);

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
      topTracks: topTracks.items,
      topArtists: topArtists.items,
      topAlbums,
      artistGenres: top5Genres,
    });
  } catch (error) {
    console.error("Error fetching top data:", error);
    res.status(500).json({ error: "Internal server error" });
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
