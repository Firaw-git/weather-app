const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const statusEl = document.querySelector("#status");
const result = document.querySelector("#result");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
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
    const parts = [place.name, place.admin1, place.country].filter(Boolean);
    setStatus(`Found: ${parts.join(", ")}`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    searchBtn.disabled = false;
  }
});

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
