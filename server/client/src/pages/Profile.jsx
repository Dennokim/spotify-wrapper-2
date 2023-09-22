import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [range, setRange] = useState('short_term'); // Default time range

  useEffect(() => {
    // Function to fetch top tracks for the selected time range
    const fetchTopData = async () => {
      try {
        //fetch top tracks
        const trackResponse = await fetch(`/top-tracks?range=${range}`);
        if (trackResponse.ok) {
          const data = await trackResponse.json();
          setTopTracks(data);
        }

        //fetch top artists
        const artistResponse = await fetch(`/top-artists?range=${range}`);
        if (artistResponse.ok){
          const data = await artistResponse.json();
          setTopArtists(data);
        }

      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };

    // Call the fetchTopTracks function when the component mounts or when the time range changes
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
      <ul>
        {topTracks.map((track, index) => (
          <li key={index}>{track.name}</li>
        ))}
      </ul>

      <h2>Top Artist</h2>
      <ul>
        {topArtists.map((artist, index) => (
          <li key={index}>{artist.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
