const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");

// Create an instance of SpotifyWebApi
const spotifyApi = new SpotifyWebApi();

async function main() {
  try {
    // Fetch the access token from your server
    const response = await axios.get("http://localhost:3000/getAccessToken");
    const accessToken = response.data.access_token;

    // Set the access token for the Spotify API instance
    spotifyApi.setAccessToken(accessToken);

    // Use the access token in your application
    console.log("Access Token:", accessToken);

    // Get the user's profile data
    const me = await spotifyApi.getMe();
    console.log("User Profile:", me.body);

    // Get the user's top tracks for different time ranges
    const topTracks4Weeks = await spotifyApi.getMyTopTracks({ limit: 10, time_range: "short_term" });
    console.log("Top Tracks (4 weeks):", topTracks4Weeks.body.items);

    const topTracks6Months = await spotifyApi.getMyTopTracks({ limit: 10, time_range: "medium_term" });
    console.log("Top Tracks (6 months):", topTracks6Months.body.items);

    const topTracksAllTime = await spotifyApi.getMyTopTracks({ limit: 10, time_range: "long_term" });
    console.log("Top Tracks (All Time):", topTracksAllTime.body.items);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the main function to get user data and top tracks
main();

