//http://api.weatherapi.com/v1/current.json?key=bafeac1f535d4e0ca9532600230106&q=new york&aqi=no

const loc = document.querySelector('.location')
const loc_temp = document.querySelector('.temp_value')
const loc_temp_unit = document.querySelector('.location_temp_unit');
const day_night = document.querySelector('.day_night')
const cond = document.querySelector('.condition')
const searchField = document.querySelector('.search_area')
const form = document.querySelector('form')
const options = document.querySelector('#myList');
var cur_unit = 'C';
var hour_week = 'week';
var city;
const UV = document.querySelector('.UV_index').getElementsByTagName("h2");
const wind_status = document.querySelector('.wind_status').getElementsByTagName("h2")
const sunrise_sunset = document.querySelector('.sunrise_sunset').getElementsByTagName("h2");
const humidity = document.querySelector('.humidity').getElementsByTagName("h2");
const visibility = document.querySelector('.visibility').getElementsByTagName("h2");
const air_quality= document.querySelector('.air_quality').getElementsByTagName("h2");

const UV_statement = document.querySelector('.UV_index .statement');
const wind_status_statement = document.querySelector('.wind_status .statement');
const sunrise_sunset_statement = document.querySelector('.sunrise_sunset .statement');
const humidity_statement = document.querySelector('.humidity .statement');
const visibility_statement = document.querySelector('.visibility .statement');
const air_quality_statement = document.querySelector('.air_quality .statement');

const celsiusBtn = document.querySelector('.celsius');
const fahrenheitBtn = document.querySelector('.fahrenheit');
const todayBtn = document.querySelector('.today');
const weekBtn = document.querySelector('.week');

const background_image = document.querySelector('body');
const icon = document.querySelector('.right img');

const cards = document.querySelector('.weatherCards');


//new code
function getTime()
{
    let date = new Date(), hours = date.getHours(), minutes = date.getMinutes();
    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    let ampm = false;
    if (hours > 12)
    {
        ampm = true;
    }
    hours %= 12;
    if (hours < 10)
    {
        hours = '0' + hours;
    }
    if (minutes < 10)
    {
        minutes = '0' + minutes;
    }
    let day = days[date.getDay()];

    if (ampm)
    {
        if (hours == 0)
        {
            return `${day}, 12:${minutes} pm`;
        }
        return `${day}, ${hours}:${minutes} pm`
    }
    else
    {
        if (hours == 0)
        {
            return `${day}, 12:${minutes} am`;
        }
        return `${day}, ${hours}:${minutes} am`;
    }
}
setInterval(() =>
{
    day_night.innerHTML = getTime();    
}, 1000)

//get current location

function getPublicIp()
{
    fetch("https://geolocation-db.com/json/")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        city = data.city;
        getWeatherData(data.city, cur_unit, hour_week);
    })
}
getPublicIp();

//get weather data

var main_data;

function getWeatherData(city, unit, hourlyOrWeek)
{
    const apiKey = 'GWHATGFK63B3MJRSUFNCGAWR6';
    fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&key=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
        main_data = data;
        console.log(data);
        if (unit == 'C')
        {
            loc_temp.innerHTML = fahrenheitToCelsius(data.currentConditions.temp);
            loc_temp_unit.innerHTML = `°C`;
        }
        else
        {
            loc_temp.innerHTML = data.currentConditions.temp;
            loc_temp_unit.innerHTML = `°F`;
        }

        loc.innerHTML = data.resolvedAddress;
        cond.innerHTML = data.currentConditions.conditions;
        UV[0].innerHTML = data.currentConditions.uvindex;
        wind_status[0].innerHTML = data.currentConditions.windspeed;
        sunrise_sunset[0].innerHTML = convertTime(data.currentConditions.sunrise);
        sunrise_sunset[1].innerHTML = convertTime(data.currentConditions.sunset);
        humidity[0].innerHTML = `${data.currentConditions.humidity}%`;
        visibility[0].innerHTML = data.currentConditions.visibility;
        air_quality[0].innerHTML = data.currentConditions.winddir;

        UV_statement.innerHTML = measureUvIndex(data.currentConditions.uvindex);
        humidity_statement.innerHTML = humidity_status(data.currentConditions.humidity);
        visibility_statement.innerHTML = visibility_status(data.currentConditions.visibility);
        air_quality_statement.innerHTML = AirQualityStatus(data.currentConditions.winddir);

        background_image.style.backgroundImage = `url(${change_background(data.currentConditions.icon)})`;
        icon.src = `${change_icon(data.currentConditions.icon)}`

        if (hour_week == "day")
        {
            updateForecast(data.days[0].hours, cur_unit, "day");
        }
        else
        {
            updateForecast(data.days, cur_unit, "week");
        }
    })
}

function changeTimeSpan(unit)
{
    if (hour_week != unit)
    {
        hour_week = unit;
        if (unit == "day")
        {
            todayBtn.classList.add('active');
            weekBtn.classList.remove('active');
            updateForecast(main_data.days[0].hours, cur_unit, hour_week);
        }
        else
        {
            todayBtn.classList.remove('active');
            weekBtn.classList.add('active');
            updateForecast(main_data.days, cur_unit, hour_week);
        }
    }
}

todayBtn.addEventListener('click', () => {
    changeTimeSpan("day");
});
weekBtn.addEventListener('click', () => {
    changeTimeSpan("week");
});

celsiusBtn.addEventListener('click', () => {
    changeUnit('C');
    celsiusBtn.classList.add('active');
    fahrenheitBtn.classList.remove('active');
});
fahrenheitBtn.addEventListener('click', () => {
    changeUnit('F');
    fahrenheitBtn.classList.add('active');
    celsiusBtn.classList.remove('active');
});

function changeUnit(unit)
{
    if (unit != cur_unit)
    {
        cur_unit = unit;
    }
    getWeatherData(city, cur_unit, hour_week);
    if (hour_week == "day")
    {
        updateForecast(main_data.days[0].hours, cur_unit, hour_week);
    }
    else
    {
        updateForecast(main_data.days, cur_unit, hour_week);
    }
}

function updateForecast(data, unit, type)
{
    cards.innerHTML = '';
    
    let day = 0;
    let numCards = 0;
    if (type == "day")
    {
        numCards = 24;
    }
    else
    {
        numCards = 7;
    }
    for (let i = 0; i < numCards; i++)
    {
        let card = document.createElement("div");
        card.classList.add("card");
        let dayName = getHour(data[day].datetime);
        if (type == "week")
        {
            dayName = getDayName(day);
        }
        let dayTemp = data[day].temp;
        if (unit == 'C')
        {
            dayTemp = fahrenheitToCelsius(data[day].temp);
        }
        let iconCondition = data[day].icon;
        let iconSrc = change_icon(iconCondition);
        let tempUnit = "°C";
        if (unit ==  'F')
        {
            tempUnit = "°F";
        }
        card.innerHTML = 
        `
            <div class='card'>
                <div class="dayname">${dayName}</div>
                <img src="${iconSrc}" alt="" class="icon">
                <div class="temp">${dayTemp}</div>
                <div class="temp-unit">${tempUnit}</div>
            </div>
        `;
        cards.appendChild(card);
        day++;
    }
}

function getHour(date)
{
    let hour = date.split(':')[0];
    let minute = date.split(':')[1];
    if (hour > 12)
    {
        hour -= 12;
        return `${hour}:${minute} PM`;
    }
    return `${hour}:${minute} AM`;
}

function getDayName(date)
{
    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ]
    return days[date];
}

function change_background(s)
{
    if (s == 'partly-cloudy-day')
    {
        return './assets/images/partlyCloudyDay.jpg';
    }
    else if (s == 'partly-cloudy-night')
    {
        return './assets/images/partlyCloudyNight.jpg';
    }
    else if (s == 'rain')
    {
        return './assets/images/rainy.webp';
    }
    else if (s == 'clear-day')
    {
        return './assets/images/clearDay.jpg';
    }
    else if (s == 'clear night')
    {
        return './assets/images/clearNight.jpg';
    }
    else 
    {
        return './assets/images/partlyCloudyDay.jpg';
    }
}

function change_icon(s)
{
    if (s == 'partly-cloudy-day')
    {
        return './assets/images/icon-partly-cloudy-day.png';
    }
    else if (s == 'partly-cloudy-night')
    {
        return './assets/images/icon-partly-cloudy-night.png';
    }
    else if (s == 'rain')
    {
        return './assets/images/icon-rainy.png';
    }
    else if (s == 'clear-day')
    {
        return './assets/images/icon-clear-day.png';
    }
    else if (s == 'clear night')
    {
        return './assets/images/icon-clear-night.png';
    }
    else 
    {
        return './assets/images/icon-partly-cloudy-day.png';
    }
}

function convertTime (time)
{
    time = time.split(':');
    let hour = time[0];
    if (hour > 12)
    {
        hour %= 12;
        let minute = time[1];
        if (hour == 0)
        {
            hour = 12;
        }
        if (minute >= 10)
        {
            return `${hour}:${minute}pm`;
        }
        return `${hour}:${minute}pm`;
    }
    else
    {
        hour %= 12;
        let minute = time[1];
        if (hour == 0)
        {
            hour = 12;
        }
        if (minute > 9)
        {
            return `${hour}:${minute}am`;
        }
        return `${hour}:${minute}am`;
    }
}

function measureUvIndex(num)
{
    if (num <= 2)
    {
        return "Low";
    }
    else if (num <= 5)
    {
        return "Moderate";
    }
    else if (num <= 7)
    {
        return "High";
    }
    else if (num <= 10)
    {
        return "Very High";
    }
    else
    {
        return "Extreme";
    }
}

function humidity_status(num)
{
    if (num <= 30)
    {
        return "Low";
    }
    else if (num <= 60)
    {
        return "Moderate";
    }
    else    
    {
        return "High";
    }
}

function visibility_status(num)
{
    if (num <= 0.16)
    {
        return "Moderate Fog";
    }
    else if (num <= 0.35)
    {
        return "Light Fog";
    }
    else if (num <= 1.13)
    {
        return  "Very Light Fog";
    }
    else if (num <= 2.16)
    {
        return "Light Mist";
    }
    else if (num <= 5.4)
    {
        return "Very Light Mist";
    }
    else if (num <= 10.8)
    {
        return "Clear Air";
    }
    else
    {
        return "Very Clear Air";
    }
}

function AirQualityStatus(num)
{
    if (num <= 50)
    {
        return "Good";
    }
    else if (num <= 100)
    {
        return "Moderate";
    }
    else if (num <= 150)
    {
        return "Unhealthy for Sensitive Groups";
    }
    else if (num <= 200)
    {
        return "Unhealthy";
    }
    else if (num <= 250)
    {
        return "Very Unhealthy";
    }
    else 
    {
        return "Hazardous";
    }
}

//convert celsius to fahrenheit
function fahrenheitToCelsius(n)
{
    return ((n - 32) * 5 / 9).toFixed(1);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let location = searchField.value;
    if (location)
    {
        city = location;
        getWeatherData(location, cur_unit, hour_week);
    }
});