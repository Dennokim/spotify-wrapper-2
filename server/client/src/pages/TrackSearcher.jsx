import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const endpoint = "https://api.spotify.com/v1";

const SearchTracks = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState("track");
  const [searchResults, setSearchResults] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Fetch the access token from your server
    fetch("/getAccessToken")
      .then((response) => response.json())
      .then((data) => {
        // Set the access token in your component state
        setAccessToken(data.access_token);
      })
      .catch((error) => {
        console.error("Error fetching access token: ", error);
      });
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${endpoint}/search?q=${searchKeyword}&type=${searchType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const res = await response.json();

      // Check if the response contains the selected searchType
      const data = res[searchType + "s"] ? res[searchType + "s"].items : [];

      setSearchResults(data);
    } catch (error) {
      console.error(`Error searching for ${searchType}s: `, error);
    }
  };

  useEffect(() => {
    // Trigger a search when the search type changes without needing to press the Search button
    if (searchKeyword) {
      handleSearch();
    }
  }, [searchType]); // Run this effect when searchType changes

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search for a track, artist, album, or playlist"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="track">Track</option>
          <option value="artist">Artist</option>
          <option value="album">Album</option>
          <option value="playlist">Playlist</option>
        </select>
        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>
      <div className="mt-4">
        {searchResults.map((item) => (
          <Card key={item.id} style={{ width: "18rem" }}>
            <Card.Img
              variant="top"
              src={
                searchType === "track"
                  ? item.album.images[0].url
                  : searchType === "artist"
                  ? (item.images && item.images[0].url) || "" // Handle images for artists
                  : "" // Handle images for albums and playlists accordingly
              }
            />
            <Card.Body>
              <Card.Title>
                {searchType === "track"
                  ? item.name
                  : searchType === "artist"
                  ? item.name
                  : item.name}
              </Card.Title>
              {searchType === "track" && (
                <Card.Text>{item.artists[0].name}</Card.Text>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchTracks;
