// variables & constants
const forecastWeather = $('#forecast');
const searchHistory = $('#history');
const locationHistory = $('#history');
const searchInput = $('#s-input');
const searchButton = $('#s-button');
const currentWeather = $('#today');
const apiKey = '159882aa7eed1e360efa6512781b1dfb';
let localStorageArray = [];

// Function to clear search history
function clearSearch() {
  localStorage.removeItem('location');
  searchHistory.empty();
}

// Funtion to display current weather for the searched location
function displayCurrentWeather(currentData) {
  const currentWeatherContainer = $('.current-weather-container');
  currentWeatherContainer.html('');
  const currentDay = dayjs().format('DD/MM/YYYY');
  const weatherIcon = currentData.weather[0];
  currentWeatherContainer.append(`
    <div class="mt-3 jumbotron jumbotron-fluid p-4 current-border">
      <div class="container">
        <h2 class="ml-2">${currentData.name} (${currentDay})<img class="ml-4" src="https://openweathermap.org/img/w/${weatherIcon.icon}.png" alt="${weatherIcon.description}"/></h2>
        <p class="ml-2">Temp: ${Math.round(currentData.main.temp)} °C</p>
        <p class="ml-2">Wind: ${Math.round(currentData.wind.speed)} KPH</p>
        <p class="ml-2">Humidity: ${currentData.main.humidity}%</p>
      </div>
    </div>
  `);
}

// Funtion to display 5-day forecast for the searched location
function displayForecastWeather(forecastData) {
  const forecastContainer = $('.forecast-container');
  forecastContainer.html('');
  const forecastDays = forecastData.list.filter(filterByDateTime);
  let output = '';

  for (const forecast of forecastDays) {
    const forecastDay = dayjs(forecast.dt * 1000).format('DD/MM/YYYY');
    const weatherIcon = forecast.weather[0];
    output += `
      <div class="forecast-item shadow-lg p-3 rb-5 rounded custom-forecast">
        <p class="text-center mb-4 font-weight-bold">${forecastDay}</p>
        <img src="https://openweathermap.org/img/w/${weatherIcon.icon}.png" alt="${weatherIcon.description}"/>
        <p class="mt-4">Temp: ${Math.round(forecast.main.temp)} °C</p>
        <p>Wind: ${Math.round(forecast.wind.speed)} M/S</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      </div>
    `;
  }

  forecastContainer.append(`
    <div class="container">
      <div class="mt-3 jumbotron jumbotron-fluid p-4">
        <h3 class="d-flex flex-wrap">5 Day Forecast</h3>
        <div class="forecast-days d-flex flex-row">${output}</div>
      </div>
    </div>
  `);
}

// Funtion to filter forecast data based on date and time
function filterByDateTime(forecastDate) {
  return dayjs(forecastDate.dt_txt).hour() === 12;
}

// Funtion to add search locations to the Search history
function addToSearchHistory() {
  const location = searchInput.val();

  if (location === '' || localStorageArray.includes(location)) {
    return;
  }

  if (!localStorage.getItem('location')) {
    localStorageArray.push(location);
  } else {
    localStorageArray = JSON.parse(localStorage.getItem('location'));

    if (!localStorageArray.includes(location)) {
      localStorageArray.push(location);
    }
  }

  searchHistory.append(`
    <button data-location="${location}" type="button" class="location-history btn btn-secondary btn-block">${location}</button>
  `);

  localStorage.setItem('location', JSON.stringify(localStorageArray));

  clickEventToPreviousButtons();
}

// Function to load and display previous searches from local storage
function localPreviousSearches() {
  if (localStorage.getItem('location')) {
    localStorageArray = JSON.parse(localStorage.getItem('location'));

    for (const place of localStorageArray) {
      searchHistory.append(`
        <button data-location="${place}" type="button" class="location-history btn btn-secondary btn-block">${place}</button>
      `);
    }
  }

  clickEventToPreviousButtons();
}

// Function to handle click events on previous search buttons
function clickEventToPreviousButtons() {
  $('.location-history button').on('click', function () {
    searchInput.val($(this).data('location'));

    $('.location-history button').removeClass('btn-info').addClass('btn-secondary');
    $(this).removeClass('btn-secondary').addClass('btn-info');
    getWeather();
  });
}
// Function to fetch and display weather information for the searched location
function getWeather(event) {
  if (searchInput.val() === '' && !isNaN(searchInput.val())) {
    alert('Error:Enter a valid location!');
    return;
  }

  $.get(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput.val()}&appid=${apiKey}&units=metric`)
    .then(function (currentData) {
      const lon = currentData.coord.lon;
      const lat = currentData.coord.lat;
      displayCurrentWeather(currentData);
      $.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(function (forecastData) {
          displayForecastWeather(forecastData);
        });
      addToSearchHistory();
      searchInput.val('');
    })
    .fail(function (error) {
      if (error.responseJSON.cod === '404') {
        alert('Location does not exist!');
        searchInput.val('');
        return;
      }
    });
}

// Function to clear local storage and search history buttons
function clearLocalStorageAndButtons() {
  localStorage.removeItem('location');
  searchHistory.empty();
  locationHistory.empty();
  localStorageArray = [];
  clickEventToPreviousButtons();
}

function init() {
  localPreviousSearches();
  clickEventToPreviousButtons();
  searchButton.click(function (event) {
    event.preventDefault();
    getWeather();
  });

  searchInput.keypress(function (event) {
    if (event.which === 13) {
      event.preventDefault();
      getWeather();
    }
  });

  $('#c-button').click(function () {
    clearLocalStorageAndButtons();
  });
}

init();
