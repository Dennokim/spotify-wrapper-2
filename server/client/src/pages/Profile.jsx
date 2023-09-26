import React, { useState, useEffect } from "react";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [topData, setTopData] = useState({
    topTracks: [],
    topArtists: [],
    topAlbums: [],
    artistGenres: [],
  });
  const [range, setRange] = useState("short_term");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Function to fetch top data for the selected time range
    const fetchTopData = async () => {
      try {
        const response = await fetch(`/top-data?range=${range}`);
        if (response.ok) {
          const data = await response.json();
          setTopData(data);
        } else {
          console.error("Failed to fetch top data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Fetch user data and playlists in a single request
    const fetchUserDataAndPlaylists = async () => {
      try {
        const response = await fetch("/user-profile");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Call the fetchTopData and fetchUserDataAndPlaylists functions when the component mounts or when the time range changes
    fetchTopData();
    fetchUserDataAndPlaylists();
  }, [range]);

  // Function to handle user's search and fetch search results
  const handleSearch = async () => {
    try {
      const response = await fetch(`/search?query=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
      } else {
        console.error("Failed to fetch search results");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div>
      {userData && (
        <div>
          <h2>User Profile</h2>
          <p>Username: {userData.display_name}</p>
          <p>Followers: {userData.followers.total}</p>
          {/* Add user profile image here */}
          <img src={userData.images[0]?.url} alt="Profile" width="200" />

          {/* Render playlists if available */}
          {userData.playlists && (
            <div>
              <h2>User Playlists</h2>
              <p>Total Playlists: {userData.totalPlaylists}</p>
              <ul>
                {userData.playlists.map((playlist, index) => (
                  <li key={index}>{playlist.name}</li>
                ))}
              </ul>
            </div>
          )}

          <h2>Top Tracks</h2>
          <div>
            {/* Dropdown to select time range */}
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="short_term">4 Weeks</option>
              <option value="medium_term">6 Months</option>
              <option value="long_term">All Time</option>
            </select>
          </div>
          <ol>
            {topData.topTracks.map((track, index) => (
              <li key={index}>{track.name}</li>
            ))}
          </ol>

          <h2>Top Artists</h2>
          <ol>
            {topData.topArtists.map((artist, index) => (
              <li key={index}>{artist.name}</li>
            ))}
          </ol>

          <h2>Top Albums</h2>
          <ol>
            {topData.topAlbums.map((album, index) => (
              <li key={index}>{album.name}</li>
            ))}
          </ol>

          <h2>Top Genres</h2>
          <ol>
            {topData.artistGenres.map((genre, index) => (
              <li key={index}>{genre}</li>
            ))}
          </ol>

          {/* Search Input */}
          <div>
            <h2>Search</h2>
            <input
              type="text"
              placeholder="Enter a song, artist, or album"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          {/* Display Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h2>Search Results</h2>
              <ul>
                {searchResults.map((result, index) => (
                  <li key={index}>{result.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
