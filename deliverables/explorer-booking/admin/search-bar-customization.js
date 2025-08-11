// Admin UI for Search Bar Customization

class SearchBarCustomization {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBaseUrl = '/api/admin/config/searchBar';
    this.config = null;
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.render();
  }

  async loadConfig() {
    try {
      const response = await fetch(this.apiBaseUrl);
      const data = await response.json();
      this.config = data || {};
    } catch (error) {
      console.error('Failed to load search bar config:', error);
      this.config = {};
    }
  }

  render() {
    if (!this.container) return;

    const colors = this.config.colors || {};
    const labels = this.config.labels || {};
    const icons = this.config.icons || {};

    this.container.innerHTML = `
      <div class="p-6 bg-white rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Search Bar Customization</h2>
        
        <form id="searchBarForm" class="space-y-6">
          <div>
            <label class="block font-medium mb-1">Default Selected Tab</label>
            <select id="defaultSelectedTab" class="w-full p-2 border rounded">
              <option value="attractions" ${this.config.defaultSelectedTab === 'attractions' ? 'selected' : ''}>Attractions</option>
              <option value="hotels" ${this.config.defaultSelectedTab === 'hotels' ? 'selected' : ''}>Hotels</option>
              <option value="flights" ${this.config.defaultSelectedTab === 'flights' ? 'selected' : ''}>Flights</option>
              <option value="transfers" ${this.config.defaultSelectedTab === 'transfers' ? 'selected' : ''}>Transfers</option>
              <option value="carRentals" ${this.config.defaultSelectedTab === 'carRentals' ? 'selected' : ''}>Car Rentals</option>
            </select>
          </div>

          <div>
            <label class="block font-medium mb-1">Colors</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label>Background</label>
                <input type="color" id="colorBackground" value="${colors.background || '#ffffff'}" class="w-full h-10">
              </div>
              <div>
                <label>Primary</label>
                <input type="color" id="colorPrimary" value="${colors.primary || '#ef4444'}" class="w-full h-10">
              </div>
              <div>
                <label>Secondary</label>
                <input type="color" id="colorSecondary" value="${colors.secondary || '#1f2937'}" class="w-full h-10">
              </div>
              <div>
                <label>Hover</label>
                <input type="color" id="colorHover" value="${colors.hover || '#f87171'}" class="w-full h-10">
              </div>
            </div>
          </div>

          <div>
            <label class="block font-medium mb-1">Labels</label>
            <input type="text" id="labelDestination" value="${labels.destinationPlaceholder || 'Where to?'}" class="w-full p-2 border rounded mb-2" placeholder="Destination Placeholder">
            <input type="text" id="labelCheckIn" value="${labels.checkInLabel || 'Check-in'}" class="w-full p-2 border rounded mb-2" placeholder="Check-in Label">
            <input type="text" id="labelGuests" value="${labels.guestsLabel || 'Guests'}" class="w-full p-2 border rounded mb-2" placeholder="Guests Label">
            <input type="text" id="labelSearchButton" value="${labels.searchButtonLabel || 'Search'}" class="w-full p-2 border rounded" placeholder="Search Button Label">
          </div>

          <div>
            <label class="block font-medium mb-1">Icons (FontAwesome class names)</label>
            <input type="text" id="iconAttractions" value="${icons.attractions || 'fa-mountain'}" class="w-full p-2 border rounded mb-2" placeholder="Attractions Icon">
            <input type="text" id="iconHotels" value="${icons.hotels || 'fa-bed'}" class="w-full p-2 border rounded mb-2" placeholder="Hotels Icon">
            <input type="text" id="iconFlights" value="${icons.flights || 'fa-plane'}" class="w-full p-2 border rounded mb-2" placeholder="Flights Icon">
            <input type="text" id="iconTransfers" value="${icons.transfers || 'fa-car'}" class="w-full p-2 border rounded mb-2" placeholder="Transfers Icon">
            <input type="text" id="iconCarRentals" value="${icons.carRentals || 'fa-key'}" class="w-full p-2 border rounded" placeholder="Car Rentals Icon">
          </div>

          <button type="submit" class="bg-primary text-white px-4 py-2 rounded hover:bg-red-600">Save Settings</button>
        </form>
      </div>
    `;

    document.getElementById('searchBarForm').addEventListener('submit', e => this.saveSettings(e));
  }

  async saveSettings(event) {
    event.preventDefault();

    const newConfig = {
      defaultSelectedTab: document.getElementById('defaultSelectedTab').value,
      colors: {
        background: document.getElementById('colorBackground').value,
        primary: document.getElementById('colorPrimary').value,
        secondary: document.getElementById('colorSecondary').value,
        hover: document.getElementById('colorHover').value
      },
      labels: {
        destinationPlaceholder: document.getElementById('labelDestination').value,
        checkInLabel: document.getElementById('labelCheckIn').value,
        guestsLabel: document.getElementById('labelGuests').value,
        searchButtonLabel: document.getElementById('labelSearchButton').value
      },
      icons: {
        attractions: document.getElementById('iconAttractions').value,
        hotels: document.getElementById('iconHotels').value,
        flights: document.getElementById('iconFlights').value,
        transfers: document.getElementById('iconTransfers').value,
        carRentals: document.getElementById('iconCarRentals').value
      }
    };

    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });

      if (response.ok) {
        alert('Search bar settings saved successfully');
      } else {
        alert('Failed to save search bar settings');
      }
    } catch (error) {
      console.error('Error saving search bar settings:', error);
      alert('Error saving search bar settings');
    }
  }
}

// Initialize Search Bar Customization UI on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  new SearchBarCustomization('searchBarCustomizationContainer');
});
