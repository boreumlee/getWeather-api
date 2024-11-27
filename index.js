require('dotenv').config();
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT;

// 캐시 설정 (TTL: 5분 = 300초)
const weatherCache = new NodeCache({ stdTTL: 300, checkperiod: 150 })

// OpenWeatherMap API 키
const API_KEY = process.env.WEATHER_KEY;

// http://localhost:3000/weather?city=Seoul
// http://localhost:3000/weather?city=suwon
app.get('/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: '도시이름을 작성해주세요. ?city=도시이름'})
    }

    const cachedWeather = weatherCache.get(city);
    if (cachedWeather) {
        return res.json({ source: 'cache', data: cachedWeather });
    }

    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric', // 섭씨 온도 사용
                lang: 'kr' // 한국어 응답
            }
        });

        const weatherData = response.data;

        // 캐시에 저장
        weatherCache.set(city, weatherData);

        res.json({ source: 'api', data: weatherData })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: '실패' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});