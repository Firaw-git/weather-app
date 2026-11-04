const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const statusEl = document.querySelector("#status");
const result = document.querySelector("#result");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function formatPlace(place) {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding failed (${response.status})`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not find a city called "${city}".`);
  }

  return data.results[0];
}

async function getWeather(place) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,wind_speed_10m`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status})`);
  }

  const data = await response.json();

  if (!data.current) {
    throw new Error("Weather data is not available for this place.");
  }

  return data;
}

function renderWeather(place, weather) {
  result.innerHTML = "";

  const card = document.createElement("div");
  card.classList.add("weather-card");

  const title = document.createElement("h2");
  title.textContent = formatPlace(place);

  const temp = document.createElement("p");
  temp.textContent = `Temperature: ${weather.current.temperature_2m}${weather.current_units.temperature_2m}`;

  const wind = document.createElement("p");
  wind.textContent = `Wind: ${weather.current.wind_speed_10m} ${weather.current_units.wind_speed_10m}`;

  card.append(title, temp, wind);
  result.append(card);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    setStatus("Please enter a city name.", true);
    return;
  }

  searchBtn.disabled = true;
  setStatus(`Searching for ${city}...`);

  try {
    const place = await getCoordinates(city);
    setStatus(`Found: ${formatPlace(place)}. Loading weather...`);

    const weather = await getWeather(place);
    renderWeather(place, weather);
    setStatus("");
  } catch (error) {
    result.innerHTML = "";
    setStatus(error.message, true);
  } finally {
    searchBtn.disabled = false;
  }
});
