import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopCharts = () => {
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    const fetchCharts = async () => {
      const options = {
        method: 'GET',
        url: 'https://shazam-api7.p.rapidapi.com/charts/get-top-songs-in_country_by_genre',
        params: {
          country_code: 'US',
          genre: 'POP',
          limit: '20'
        },
        headers: {
          'X-RapidAPI-Key': '4f484c1165msh4c691a3476e9f2bp1746e1jsnb951a6563ff6',
          'X-RapidAPI-Host': 'shazam-api7.p.rapidapi.com'
        }
      };

      try {
        const response = await axios.request(options);
        setCharts(response.data.tracks);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCharts();
  }, []);

  return (
    <div>
      <h1>Top Charts in the US</h1>
      <ul>
        {charts.map((chart) => (
          <li key={chart.track_id}>
            {chart.track_name} - {chart.artist_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopCharts;
