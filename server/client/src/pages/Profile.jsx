import React, { useState, useEffect } from "react";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [topData, setTopData] = useState({
    topTracks: [],
    topArtists: [],
    topAlbums: [],
    artistGenres: [], // Added state to store top genres
  });
  const [range, setRange] = useState("short_term"); // Default time range

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

    //fetch users data
    const fetchUserData = async () => {
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

    // Call the fetchTopData function when the component mounts or when the time range changes
    fetchTopData();
    fetchUserData();
  }, [range]);

  return (
    <div>
      {userData && (
        <div>
          <h2>User Profile</h2>
          <p>Username: {userData.display_name}</p>
          <p>Followers: {userData.followers.total}</p>
          {/* Add user profile image here */}
          <img src={userData.images[0]?.url} alt="Profile" width="200" />

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
        </div>
      )}
    </div>
  );
};

export default Profile;
