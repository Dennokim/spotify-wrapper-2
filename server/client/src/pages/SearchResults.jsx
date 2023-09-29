import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  InputGroup,
  FormControl,
  Button,
  Row,
  Card,
  Dropdown,
} from "react-bootstrap";

export default function SearchResults() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [searchType, setSearchType] = useState("artist"); // Default search type
  const [searchResults, setSearchResults] = useState([]);
  const SEARCH_DISPLAY_TEXT = "Displaying results for: ";

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

  async function search() {
    try {
      const searchParameters = {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      let endpoint = "";
      let itemType = "";

      switch (searchType) {
        case "artist":
          endpoint =
            "https://api.spotify.com/v1/search?q=" +
            searchInput +
            "&type=artist";
          itemType = "artists";
          break;
        case "playlist":
          endpoint =
            "https://api.spotify.com/v1/search?q=" +
            searchInput +
            "&type=playlist";
          itemType = "playlists";
          break;
        case "track":
          endpoint =
            "https://api.spotify.com/v1/search?q=" +
            searchInput +
            "&type=track";
          itemType = "tracks";
          break;
        case "album":
          endpoint =
            "https://api.spotify.com/v1/search?q=" +
            searchInput +
            "&type=album";
          itemType = "albums";
          break;
        default:
          break;
      }

      const searchData = await fetch(endpoint, searchParameters)
        .then((response) => response.json())
        .then((data) => data[itemType]?.items || []);

      setSearchResults(searchData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  return (
    <div className="App mt-4 px-3">
      <Container>
        <InputGroup className="m-3" size="lg">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {searchType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSearchType("artist")}>
                Artist
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSearchType("playlist")}>
                Playlist
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSearchType("track")}>
                Track
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSearchType("album")}>
                Album
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <FormControl
            placeholder={`Search for ${searchType}...`}
            type="input"
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      <Container className="grid">
        <Row className="row">
          {searchResults.length > 0 ? (
            <p className="text-start h5 fw-lighter">
              {SEARCH_DISPLAY_TEXT}
              <small>{searchInput}</small>
            </p>
          ) : (
            <p>No results found for: {searchInput}</p>
          )}
        </Row>

        <Row className="row row-cols-lg-4 row-cols-sm-1">
          {searchResults.map((result, index) => (
            <div className="col-md-3" key={index}>
              <Card className="p-2 m-2">
                <a href={result.external_urls?.spotify}>
                  <Card.Img
                    src={result?.images[0]?.url || "/placeholder_image.jpg"} // Use the actual image URL if available, otherwise use a placeholder image
                  />
                </a>
                <Card.Body>
                  <Card.Title className="">{result.name}</Card.Title>
                  {result.type === "track" && (
                    <Card.Text className="">Track</Card.Text>
                  )}
                  {result.type === "artist" && (
                    <Card.Text className="">Artist</Card.Text>
                  )}
                  {result.type === "album" && (
                    <>
                      <Card.Text className="">
                        Release date: {result.release_date}
                      </Card.Text>
                      <Card.Text className="">
                        Tracks: {result.total_tracks}
                      </Card.Text>
                    </>
                  )}
                  {result.type === "playlist" && (
                    <Card.Text className="">Playlist</Card.Text>
                  )}
                  {/* Add additional information here based on the item type */}
                </Card.Body>
              </Card>
            </div>
          ))}
        </Row>
      </Container>
    </div>
  );
}
