import { useState, useEffect } from "react";

// Desktop slike
import clearNightDesktop from "./assets/images/desktop/clear-night.jpg";
import nightRainDesktop from "./assets/images/desktop/night-rain.jpg";
import sunnyDesktop from "./assets/images/desktop/sunny.jpg";
import rainDesktop from "./assets/images/desktop/rain.jpg";
import thunderstormDesktop from "./assets/images/desktop/thunderstorm.jpg";
import cloudyDesktop from "./assets/images/desktop/cloudy.jpg";
import snowDesktop from "./assets/images/desktop/snow.jpg";

// Mobilne slike
import clearNightMobile from "./assets/images/mobile/clear-night.jpg";
import nightRainMobile from "./assets/images/mobile/night-rain.jpg";
import sunnyMobile from "./assets/images/mobile/sunny.jpg";
import rainMobile from "./assets/images/mobile/rain.jpg";
import thunderstormMobile from "./assets/images/mobile/thunderstorm.jpg";
import cloudyMobile from "./assets/images/mobile/cloudy.jpg";
import snowMobile from "./assets/images/mobile/snow.jpg";

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // API ključ
  const API_KEY = "d64d16caef6884eaa2b9961e20c51a16";

  // Objekat koji mapira vremenske uslove na odgovarajuće slike
  const weatherImages = {
    desktop: {
      clearNight: clearNightDesktop,
      nightRain: nightRainDesktop,
      sunny: sunnyDesktop,
      rain: rainDesktop,
      thunderstorm: thunderstormDesktop,
      cloudy: cloudyDesktop,
      snow: snowDesktop
    },
    mobile: {
      clearNight: clearNightMobile,
      nightRain: nightRainMobile,
      sunny: sunnyMobile,
      rain: rainMobile,
      thunderstorm: thunderstormMobile,
      cloudy: cloudyMobile,
      snow: snowMobile
    }
  };

  // Provera veličine ekrana
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Funkcija za dobijanje lokalnog vremena grada
  const getLocalTime = (timezone) => {
    const localDate = new Date(new Date().getTime() + timezone * 1000);
    return {
      hours: localDate.getUTCHours(),
      minutes: localDate.getUTCMinutes(),
      timeString: localDate.toLocaleTimeString("sr-RS", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC"
      })
    };
  };

  // Funkcija za dobijanje predloga gradova
  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
      setSuggestions([]);
    }
  };

  // Funkcija za određivanje pozadinske slike
  const getBackgroundImage = (weatherData) => {
    if (!weatherData) return "";

    const { hours } = getLocalTime(weatherData.timezone);
    const isNight = hours < 6 || hours > 20;
    const weatherId = weatherData.weather[0].id;
    const imageSet = isMobile ? weatherImages.mobile : weatherImages.desktop;

    if (isNight) {
      if (weatherId >= 200 && weatherId < 600) {
        return imageSet.nightRain;
      }
      return imageSet.clearNight;
    } else {
      if (weatherId >= 200 && weatherId < 300) {
        return imageSet.thunderstorm;
      } else if (weatherId >= 300 && weatherId < 600) {
        return imageSet.rain;
      } else if (weatherId >= 600 && weatherId < 700) {
        return imageSet.snow;
      } else if (weatherId >= 801 && weatherId < 805) {
        return imageSet.cloudy;
      }
      return imageSet.sunny;
    }
  };

  // Funkcija za dohvatanje podataka o vremenu
  const fetchWeatherData = (url) => {
    setLoading(true);
    setError("");
    setShowSuggestions(false);
    setIsImageLoading(true);

    fetch(url)
      .then((response) => {
        if (!response.ok)
          throw new Error("Nije moguće dobiti podatke o vremenu");
        return response.json();
      })
      .then((data) => {
        setWeather(data);
        setCity(data.name);
        const { timeString } = getLocalTime(data.timezone);
        setLocalTime(timeString);

        // Preload slike
        const img = new Image();
        img.src = getBackgroundImage(data);
        img.onload = () => setIsImageLoading(false);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Greška:", error.message);
        setError(
          "Nije moguće dobiti podatke o vremenu. Molimo pokušajte ponovo."
        );
        setWeather(null);
        setLoading(false);
        setIsImageLoading(false);
      });
  };

  // Funkcija za dobijanje vremena prema lokaciji
  const getWeatherByLocation = (latitude, longitude) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    fetchWeatherData(url);
  };

  // Funkcija za pretragu
  const handleSearch = (cityName, lat, lon) => {
    if (!cityName) return;

    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
    }
    fetchWeatherData(url);
  };

  // Funkcija za dobijanje lokacije korisnika
  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherByLocation(latitude, longitude);
        },
        (error) => {
          console.error("Greška pri dobijanju lokacije:", error);
          setError(
            "Nije moguće dobiti vašu lokaciju. Molimo unesite grad ručno."
          );
          setLoading(false);
        }
      );
    } else {
      setError("Geolokacija nije podržana u vašem pretraživaču.");
      setLoading(false);
    }
  };

  // Inicijalno učitavanje lokacije korisnika
  useEffect(() => {
    getUserLocation();
  }, []);

  // Funkcija za promenu input polja
  const handleInputChange = (e) => {
    const inputCity = e.target.value;
    setCity(inputCity);
    setShowSuggestions(true);
    fetchCitySuggestions(inputCity);
  };

  // Funkcija za odabir predloženog grada
  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    handleSearch(suggestion.name, suggestion.lat, suggestion.lon);
  };

  // Funkcija za formatiranje vremena izlaska/zalaska sunca
  const formatSunTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString("sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC"
    });
  };

  return (
    <div
      className={`min-h-screen relative ${isImageLoading ? "bg-black" : ""}`}
      style={{
        background:
          weather && !isImageLoading
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${getBackgroundImage(
                weather
              )})`
            : "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "all 0.5s ease-in-out"
      }}
    >
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-start lg:w-1/2 p-4">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Umbrella Weather
          </h1>
          <div className="mt-4 w-full relative">
            <input
              type="text"
              className="w-full p-2 rounded bg-white bg-opacity-80"
              placeholder="Pretraži grad"
              value={city}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full bg-white mt-1 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.name}-${index}`}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}, {suggestion.country}
                    {suggestion.state && `, ${suggestion.state}`}
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              onClick={getUserLocation}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full md:w-auto"
            >
              Use my location
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 p-4 mt-6 lg:mt-0">
          {loading && (
            <div className="text-white text-center">
              <p>Loading...</p>
            </div>
          )}

          {weather && !loading && (
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4">
                {weather.name}, {weather.sys.country}
              </h2>
              <p className="text-xl mb-4">Local time: {localTime}</p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt="weather icon"
                  className="w-24 h-24"
                />
                <p className="text-6xl font-bold">
                  {Math.round(weather.main.temp)}°C
                </p>
              </div>
              <p className="text-2xl mt-2 capitalize">
                {weather.weather[0].description}
              </p>
              <div className="mt-6 text-lg">
                <p className="mb-2">Wind speed: {weather.wind.speed} m/s</p>
                <p className="mb-2">Humidity: {weather.main.humidity}%</p>
                <p className="mb-2">
                  Sunrise:{" "}
                  {formatSunTime(weather.sys.sunrise, weather.timezone)}
                </p>
                <p>
                  Sunset: {formatSunTime(weather.sys.sunset, weather.timezone)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
