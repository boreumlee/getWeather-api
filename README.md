# 간단한 날씨 정보 API

- **기능**:
    - 특정 도시의 현재 날씨 정보 반환(OpenWeatherMap API 연동).
- **기술 스택**:
    - Node.js + Express
    - Axios (외부 API 호출)
- **포인트**:
    - 외부 API 연동 학습.
    - 캐싱 처리(예: 특정 도시 데이터를 일정 시간 동안만 유지).
    - 확장: 지역 검색 자동완성 기능 추가.

---

1. 프로젝트 파일 구조
    
    ```bash
    weather-api/
    ├── index.js
    ├── package.json
    └── .env
    ```
    

1. index.js
    
    ```jsx
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
    ```
    

1. 설치
    
    ```jsx
    npm i express, axios, dotenv, node-cache
    ```
    
2. node-cache
node-cache는 Node.js 에서 사용할 수 있는 간단한 메모리 기반 캐싱 라이브러리임
자주 호출하거나 시간이 오래 걸리는 연산의 결과를 캐시에 저장해서 성능을 향상시키기 위해 사용함
캐시는 일정 시간이 지나면 자동으로 데이터를 삭제할 수 있어서 효율적임

    - **메모리 기반**:
        - 애플리케이션이 실행되는 동안 메모리에 데이터를 저장
        - 외부 데이터베이스나 파일 시스템이 필요하지 않음
    - **TTL 지원**:
        - TTL(Time-To-Live)을 설정하여 캐시 데이터를 자동으로 만료시킬 수 있음
    - **간단한 사용법**:
        - 키-값 쌍으로 데이터를 저장하고, 빠르게 읽어옴
    - **주요 사용 사례**:
        - API 응답 캐싱.
        - 빈번하게 참조되는 설정 값 저장.
        - 계산 결과 캐싱.
    
    ```jsx
    const NodeCache = require('node-cache');
    
    // TTL: 5분(300초)
    const myCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
    
    // 데이터 저장
    myCache.set('key', 'value');
    
    // 데이터 가져오기
    const value = myCache.get('key');
    if (value) {
        console.log('Cache hit:', value);
    } else {
        console.log('Cache miss');
    }
    
    // 데이터 삭제
    myCache.del('key');
    
    // 캐시 초기화 (모든 데이터 삭제)
    myCache.flushAll();
    ```
    
    ```jsx
    // TTL(Time-To-Live)을 설정하면 특정 키의 데이터가 자동으로 만료됨
    // 10초후에 만료됨
    myCache.set('tempData', '10초후 만료', 10);
    ```
    
    - 옵션
    
    | 옵션 | 기본값 | 설명 |
    | --- | --- | --- |
    | `stdTTL` | 0 | 모든 캐시 항목에 적용되는 기본 TTL(초). 0이면 만료되지 않음. |
    | `checkperiod` | 600 | 만료된 항목을 주기적으로 삭제하는 간격(초). |
    | `useClones` | true | 캐시에 저장/반환할 때 객체를 복사하여 데이터 무결성을 보장. |
    
    ### **장점**
    
    - 빠른 읽기/쓰기 속도.
    - 간단한 구현.
    - 외부 의존성이 적음.
    
    ### **주의사항**
    
    - **메모리 제한**: 캐시 데이터는 메모리에 저장되므로 큰 데이터를 캐싱하거나 무제한으로 사용할 경우 메모리가 부족할 수 있음
    - **분산 캐시 지원 부족**: `node-cache`는 단일 인스턴스에서만 작동하므로 분산 환경에서는 적합하지 않음 (분산 캐시는 Redis 또는 Memcached 사용을 권장)
