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

  const handleSearchTracks = async () => {
    try {
      const encodedSearchKeyword = encodeURIComponent(searchKeyword);
      const response = await fetch(
        `${endpoint}/search?q=${encodedSearchKeyword}&type=track`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const res = await response.json();
      const data = res.tracks ? res.tracks.items : [];
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for tracks: ", error);
    }
  };

  const handleSearchArtists = async () => {
    try {
      const encodedSearchKeyword = encodeURIComponent(searchKeyword);
      const response = await fetch(
        `${endpoint}/search?q=${encodedSearchKeyword}&type=artist`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
          },
        }
      );
      const res = await response.json();
      const data = res.artists ? res.artists.items : [];
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for artists: ", error);
    }
  };

  const handleSearchAlbums = async () => {
    try {
      const encodedSearchKeyword = encodeURIComponent(searchKeyword);
      const response = await fetch(
        `${endpoint}/search?q=${encodedSearchKeyword}&type=album`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const res = await response.json();
      const data = res.albums ? res.albums.items : [];
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for albums: ", error);
    }
  };

  const handleSearchPlaylists = async () => {
    try {
      const encodedSearchKeyword = encodeURIComponent(searchKeyword);
      const response = await fetch(
        `${endpoint}/search?q=${encodedSearchKeyword}&type=playlist`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const res = await response.json();
      const data = res.playlists ? res.playlists.items : [];
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for playlists: ", error);
    }
  };

  const handleSearch = async () => {
    switch (searchType) {
      case "track":
        handleSearchTracks();
        break;
      case "artist":
        handleSearchArtists();
        break;
      case "album":
        handleSearchAlbums();
        break;
      case "playlist":
        handleSearchPlaylists();
        break;
      default:
        // Handle other search types or errors
        break;
    }
  };

  useEffect(() => {
    // Trigger a search when the search type changes without needing to press the Search button
    if (searchKeyword) {
      handleSearch();
    }
  }, [searchType, searchKeyword]); // Run this effect when searchType or searchKeyword changes

  const renderCardContent = (item) => {
    console.log(`Search type: ${searchType}`);
    console.log(`Search results: `, searchResults);

    switch (searchType) {
      case "track":
        return (
          <>
            <Card.Img variant="top" src={item.album.images[0].url} />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
              <Card.Text>{item.artists[0].name}</Card.Text>
            </Card.Body>
          </>
        );
      case "artist":
        return (
          <>
            <Card.Img
              key={item.id}
              variant="top"
              src={(item.images && item.images[0].url) || ""}
            />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
            </Card.Body>
          </>
        );
      case "album":
        return (
          <>
            <Card.Img variant="top" src={item.images[0].url} />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
            </Card.Body>
          </>
        );
      case "playlist":
        return (
          <>
            <Card.Img variant="top" src={item.images[0].url} />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
            </Card.Body>
          </>
        );
      default:
        return null;
    }
  };

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
            {renderCardContent(item)}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchTracks;
