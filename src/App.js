import React, { Component } from 'react';
import './App.css';

class App extends Component {

  state = {
    mapScriptLoading: true,
    locations: [],
    markers: []
  }


  componentDidMount() {
    // Enable google to invoke initMap function
    window.initMap = this.initMap;
    // Add google maps script to body
    this.addScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAmgEg9okyBH-QCEAGu-UF2pIWVamfk7uU&v=3&callback=initMap')
      .catch ( () => this.setState({ mapScriptLoading: false}) );
    // get location data
    this.setState( {locations: this.getLocations()} )
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
      {"title": "Paluknys Airport", "location": {"lat": 54.483056, "lng": 24.989722}, "icao": "EYSI"}
    ];

    return locations;
  }

  // add google maps script to body
  addScript = (src) => {
      return new Promise(function (resolve, reject) {
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
    const { google } = window;

    let mapInit;

    const mapview = document.getElementById('map');

    let bounds = new google.maps.LatLngBounds();

    mapInit = new google.maps.Map(mapview, {
      center: {lat: 55.322000, lng: 23.897000},
      zoom: 7,
    });

    

    // Create a marker per location, and put into markers array.
    this.state.locations.map((location, index) => {
      let marker = new google.maps.Marker({
        map: mapInit,
        position: location.location,
        title: location.title,
        animation: google.maps.Animation.DROP,
        id: index
      })
      // Push the marker to our state array of markers
      this.setState({ markers: [...this.state.markers, marker] });
      bounds.extend(this.state.markers[index].position);
    })

    // Extend the boundaries of the map for each marker
    mapInit.fitBounds(bounds);
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

  render() {
    return (
      <div className="App">

        <header>
          <h1 tabIndex="0">Selected location</h1>
        </header>

        <nav id="menu">

          <button aria-label="menu" id="menu_button" onClick={() => this.toggleMenu()}></button>

          <div id="menuHeader">
            <div className="logo"></div>
          </div>

          <input tabIndex="0" aria-label="Filter list" id="filterInput" type="text" name="filter" placeholder="Enter location" />

          <ul id="filteredList">
            { this.state.locations &&( this.state.locations.map( location => (
                <li key={location.title} tabIndex="0">{location.title}</li>
              ))
            )}
          </ul>

        </nav>

        <main id="mapContainer">
          { this.state.mapScriptLoading === false && (
            <div className="error">Something went wrong... Please try again...</div>
          )}
          <div id="map" role="application" aria-hidden="true" aria-label="Google maps application"></div>
          
        </main>

      </div>
    );
  }
}

export default App;