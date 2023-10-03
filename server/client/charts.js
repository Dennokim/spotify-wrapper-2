import axios from "axios";

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
	console.log(response.data);
} catch (error) {
	console.error(error);
}