import React, { Component } from 'react';
import './App.css';

class App extends Component {

  state = {
    mapScriptLoading: true
  }


  componentDidMount() {
    // Enable google to invoke initMap function
    window.initMap = this.initMap;
    // Add google maps script to body
    this.addScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAmgEg9okyBH-QCEAGu-UF2pIWVamfk7uU&v=3&callback=initMap')
      .catch ( () => this.setState({ mapScriptLoading: false}) )
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
    let map;
    const mapview = document.getElementById('map');

    map = new window.google.maps.Map(mapview, {
      center: {lat: 54.896779, lng: 23.886382},
      zoom: 15,
    });

    const kaunasCityMuseum = {lat: 54.896779, lng: 23.886382};
    // eslint-disable-next-line
    const marker = new window.google.maps.Marker({
      position: kaunasCityMuseum,
      map: map,
      title: 'Kaunas City Museum'
    });
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
            <h2>Logotype</h2>
          </div>

          <input tabIndex="0" aria-label="Filter list" id="filterInput" type="text" name="filter" placeholder="Enter location" />

          <ul id="filteredList">
            <li tabIndex="0">Kaunas City Museum</li>
            <li tabIndex="0">Historical Presidential Palace</li>
            <li tabIndex="0">Confluence Park</li>
            <li tabIndex="0">House of Perkūnas</li>
            <li tabIndex="0">Maironis Lithuanian Literature Museum</li>
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