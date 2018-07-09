import React, { Component } from 'react';
import './App.css';
import './Weather.css';
import compassArrow from'./icons/compass-arrow.svg';
import compassError from'./icons/error.svg';
import escapeRegExp from 'escape-string-regexp'

class App extends Component {


  state = {
    mapScriptLoading: true,
    locations: [],
    mapInit: {},
    markers: [],
    bounds: {},
    infoWindow: {},
    query: '',
    selectedMarker: {},
    previousTab: ''
  }


  componentDidMount() {
    // Enable google to invoke initMap function
    window.initMap = this.initMap;
    // Add google maps script to body
    this.addScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAmgEg9okyBH-QCEAGu-UF2pIWVamfk7uU&v=3&callback=initMap')
      .catch ( () => this.setState({ mapScriptLoading: false}) );
    // get location data
    this.setState( {locations: this.getLocations()} );

    this.init();
  }


  init = () => {
    // handle tab, if user uses tab, show focus ring
    function handleFirstTab(e) {
        if (e.keyCode === 9) { // the "I am a keyboard user" key
            document.body.classList.add('user-is-tabbing');
            window.removeEventListener('keyup', handleFirstTab);
            console.log('shout');
        }
    }
    window.addEventListener('keydown', handleFirstTab);

    // focus on filter element
    document.getElementById('filterInput').focus();

  }

  // get location data
  // TODO: get this data from external API
  getLocations = () => {
    const locations = [
      {"title": "S. Darius and S. Girėnas Airport", "location": {"lat": 54.880278, "lng": 23.881944}, "icao": "EYKS"},
      {"title": "Sasnava Airport", "location": {"lat": 54.662222, "lng": 23.452222}, "icao": "EYMM"},
      {"title": "Alytus Airport", "location": {"lat": 54.413056, "lng": 24.056944}, "icao": "EYAL"},
      {"title": "Molėtai Airport", "location": {"lat": 55.113056, "lng": 25.336667}, "icao": "EYMO"},
      {"title": "Tauragė Airport", "location": {"lat": 55.231667, "lng": 22.150278}, "icao": "EYTR"},
      {"title": "Šilutė Airport", "location": {"lat": 55.336944, "lng": 21.530556}, "icao": "EYSI"},
      {"title": "Nida Airport", "location": {"lat": 55.327778, "lng": 21.045556}, "icao": "EYSI"},
      {"title": "Paluknys Airport", "location": {"lat": 54.483056, "lng": 24.989722}, "icao": "EYVP"}
    ];

    return locations;
  }

  // add google maps script to body
  addScript = (src) => {
      return new Promise((resolve, reject) => {
          let script;

          script = document.createElement('script');
          script.async = true;
          script.defer = true;
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;

          document.body.appendChild(script);
      });
  }


  // Init map function
  initMap = () => {
    const self = this;
    const { google } = window;
    const mapview = document.getElementById('map');
    let markers = [];

    this.setState({
      mapInit: new google.maps.Map(mapview, {
        center: {lat: 55.322000, lng: 23.897000},
        zoom: 7}),
      bounds: new google.maps.LatLngBounds(),
      infoWindow: new google.maps.InfoWindow()
    });

    google.maps.event.addListener(this.state.infoWindow, 'closeclick', () => self.closeInfoWindow());

    // if window resized, fit to bounds
    window.addEventListener('resize', () => self.state.mapInit.fitBounds(self.state.bounds));

    // close infowindow with escape if open
    window.addEventListener('keyup', (e) => {
      if (self.state.infoWindow.map && e.keyCode === 27) {
        // set focus on last selectedMarker
        self.focusOn(self.state.selectedMarker.title);
        // close infoWindow
        self.state.infoWindow.close();
        self.closeInfoWindow();
      }
    });

    // Create a marker per location, and put into markers array.
    markers = this.state.locations.map(location => {
      let marker = new google.maps.Marker({
        map: this.state.mapInit,
        position: location.location,
        title: location.title,
        icao: location.icao,
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => self.infoWindow(marker));

      this.state.bounds.extend(marker.position);

      return marker;
    });

    // Push the markers to our state
    this.setState({ markers: markers });

    // Extend the boundaries of the map for each marker
    this.state.mapInit.fitBounds(this.state.bounds);
  }

  // Show info window
  infoWindow = (marker) => {

    // if trying to select the same marker exit
    if(marker === this.state.selectedMarker){
      return
    }
    // if there is old info window open, close it.
    this.closeInfoWindow();

    // open infoWindow
    this.state.infoWindow.open(this.state.mapInit, marker);
    this.state.infoWindow.setContent(`${marker.title}`);
    marker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
    marker.setAnimation(window.google.maps.Animation.BOUNCE);

    // get content for infoWindow
    const lat = marker.position.lat();
    const lng = marker.position.lng();
    this.getContent(lat, lng, marker);

    // Bounce for one sec
    setTimeout( () => {marker.setAnimation(null)}, 1000);

    this.setState({ selectedMarker: marker});

  }

  getContent = (lat, lng, marker) => {
  const api = 'https://api.openweathermap.org/data/2.5';
  const apiKey = '6f5fb6461397285ca5eff0edbb8efacd';

  const headers = { 'Accept': 'application/json' };

  fetch(`${api}/weather?lat=${lat}&lon=${lng}&units=metric&APPID=${apiKey}`, { headers })
      .then(response => response.json())
      .then(data => {
        this.state.infoWindow.setContent(`
            <div class="weather">
              <h2 id="infoWindowHeader" tabIndex="0">${marker.title} ${marker.icao ? '- ' + marker.icao : ''}</h2>

              <div class="w-details">
                <div class="row">
                  <img tabIndex="0" src="${data.weather[0].icon ? 'https://openweathermap.org/img/w/' + data.weather[0].icon + '.png' : compassError}"
                    alt="${data.weather[0].description ? data.weather[0].description : 'No weather description'}">
                  <div tabIndex="0" class="temperature">${data.main.temp ? data.main.temp + '°C' : 'N/A'}</div>
                </div>
                <div class="row compass">
                  <img tabIndex="0" class="compassArrow"
                        src="${data.wind.deg ? compassArrow : compassError}"
                        style="transform: rotate(${data.wind.deg ? data.wind.deg : '0'}deg)"
                        alt="${data.wind.deg ? 'Wind blows from ' + this.convertDegToCompass(data.wind.deg) : 'Wind direction is not available'}"
                        >
                </div>
              </div>

              <div class="row">
                <p tabIndex="0">Wind speed: ${data.wind.speed ? data.wind.speed + 'm/s' : 'N/A'}</p>
                <p tabIndex="0">Humidity: ${data.main.humidity ? data.main.humidity + '%' : 'N/A'}</p>
                <p tabIndex="0">Visibility: ${data.visibility ? data.visibility + 'm' : 'N/A'}</p>
                <p tabIndex="0">Sunrise: ${data.sys.sunrise ? this.convertTime(data.sys.sunrise) : 'N/A'}</p>
                <p tabIndex="0">Sunset: ${data.sys.sunset ? this.convertTime(data.sys.sunset) : 'N/A'}</p>
              </div>
            </div>
          `);
        this.focusOn('infoWindowHeader');
      }).catch(() => {
        this.state.infoWindow.setContent(`
          <div class="weather">
            <h2 id="infoWindowHeader" tabIndex="0">${marker.title} ${marker.icao ? '- ' + marker.icao : ''}</h2>
            <p tabIndex="0">Sorry, we can't get weather information right now. Please try again later.</p>
          </div>
          `);
        this.focusOn('infoWindowHeader');
      })
  }

  // focus on element with id
  focusOn = (id) => {
    document.getElementById(id).focus();
  }


  // Close and set red icon
  closeInfoWindow = () => {
    if(this.state.selectedMarker){
      this.state.markers.filter(marker => marker === this.state.selectedMarker)
                        .map(marker => marker.setIcon('https://maps.google.com/mapfiles/ms/icons/red-dot.png'));
      this.setState({ selectedMarker: {} });
    } else {
      this.state.infoWindow.close();
    }
  }


  // Open and Close menu
  toggleMenu = () => {
    const menu = document.getElementById('menu');
    const mapContainer = document.getElementById('mapContainer');

    menu.classList.toggle('open');

    if(menu.classList.contains('open')){
      mapContainer.style.marginLeft = '300px';
    } else {
      mapContainer.style.marginLeft = '';
    }
  }

  // update query and filter out locations
  updateQuery = (query) => {
    this.setState({ query: query });
    if (query) {
      const match = new RegExp(escapeRegExp(query), 'i');
      this.state.markers.map((marker) => marker.setVisible(false));
      this.state.markers.filter((marker) => match.test(marker.title)).map((marker => marker.setVisible(true)));
    } else {
      this.state.markers.map((marker) => marker.setVisible(true));
    }
    // close infowindow if opened
    if (this.state.infoWindow.map) {
        this.state.infoWindow.close();
        this.closeInfoWindow();
    }
  }

  // return only visible locations
  getVisibleLocations = () => {
    return this.state.markers.filter((marker) => marker.visible);
  }

  convertTime = (unixTime) => {
    const date = new Date(unixTime*1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();

    // Return time in hh:mm:ss format
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  convertDegToCompass = (deg) => {
    const val = Math.floor((deg / 22.5) + 0.5);
    const direction = [
                        "North",
                        "North-northeast",
                        "Northeast",
                        "East-northeast",
                        "East",
                        "East-southeast",
                        "Southeast",
                        "South-southeast",
                        "South",
                        "South-southwest",
                        "Southwest",
                        "West-southwest",
                        "West",
                        "West-northwest",
                        "Northwest",
                        "North-northwest"
                        ];

    return direction[(val % 16)];
  }

  render() {
    return (
      <div className="App">

        <header>
          <h1>{this.state.selectedMarker.title ? this.state.selectedMarker.title : 'Select location'}</h1>
        </header>

        <nav id="menu">

          <button tabIndex="0" aria-label="menu" id="menu_button" onClick={() => this.toggleMenu()}></button>

          <div id="menuHeader">
            <div className="logo"></div>
          </div>

          <input tabIndex="0"
                  aria-label="Filter list"
                  id="filterInput"
                  type="text"
                  name="filter"
                  placeholder="Enter location"
                  onChange={(event) => this.updateQuery(event.target.value)}
                  />

          <ul id="filteredList">
            { this.state.locations &&(
              this.getVisibleLocations().map( marker => (
                <li role="button"
                    key={marker.title}
                    id={marker.title}
                    className={this.state.selectedMarker.title === marker.title ? 'bold':'regular'}
                    tabIndex="0"
                    onClick={() => this.infoWindow(marker)}
                    onKeyPress={() => this.infoWindow(marker)}>
                    {marker.title}
                    
                </li>
              ))
            )}
          </ul>

        </nav>

        <main id="mapContainer">
          { this.state.mapScriptLoading === false && (
            <div className="error">Something went wrong... Please try again...</div>
          )}
          <div id="map" role="application"  aria-label="Google maps application"></div>
          
        </main>

      </div>
    );
  }
}

export default App;