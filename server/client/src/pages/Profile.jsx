import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [topData, setTopData] = useState({
    topTracks: [],
    topArtists: [],
    topAlbums: [],
  });
  const [range, setRange] = useState('short_term'); // Default time range

  useEffect(() => {
    // Function to fetch top data for the selected time range
    const fetchTopData = async () => {
      try {
        const response = await fetch(`/top-data?range=${range}`);
        if (response.ok) {
          const data = await response.json();
          setTopData(data);
        } else {
          console.error('Failed to fetch top data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the fetchTopData function when the component mounts or when the time range changes
    fetchTopData();
  }, [range]);

  return (
    <div>
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
    </div>
  );
};

export default Profile;
