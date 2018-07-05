import React, { Component } from 'react';
import './App.css';

class App extends Component {

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
          <div id="map" role="application" aria-hidden="true" aria-label="Google maps application"></div>
        </main>

      </div>
    );
  }
}

export default App;