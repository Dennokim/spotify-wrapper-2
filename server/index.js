const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQASAgD-YjgOWnv2jBiUI0GHFwQyQbGMW3fJIXsmM-hcm5UmJqU82be22IxBAzAfzSjyWYxmkzozL5QmWF4j0lKrxH9AUVVBpQYDsmK3SLQIASkhudPtBOvEycRmGeegI5lTyyI7yeORUsdmZo5CD6q0cRagmUxnqnJgAvKJeLqghcn6hN-9tOUyXQ5xZCJ67xQr1Zg";

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

//GET MY PROFILE DATA
function getMyData() {
  (async () => {
    const me = await spotifyApi.getMe();
    console.log(me.body);
    getUserPlaylists(me.body.id);
  })().catch(e => {
    console.error(e);
  });
}