// Bland AI Menu Integration for Master Dashboard

class BlandAIMenu {
  constructor() {
    this.menuId = 'bland-ai-menu';
    this.subMenuId = 'bland-ai-submenu';
    this.initMenu();
  }

  initMenu() {
    // Create main menu item
    const mainMenu = document.createElement('li');
    mainMenu.id = this.menuId;
    mainMenu.className = 'nav-item relative cursor-pointer';

    mainMenu.innerHTML = `
      <div class="flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <span class="font-semibold text-gray-700 dark:text-gray-200">Bland AI</span>
        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    `;

    // Create submenu container
    const subMenu = document.createElement('ul');
    subMenu.id = this.subMenuId;
    subMenu.className = 'submenu hidden absolute left-full top-0 mt-0 ml-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50';

    // Add submenu items
    const submenuItems = [
      { id: 'pathways', label: 'Pathways', href: '#/bland-ai/pathways' },
      { id: 'calls', label: 'Calls', href: '#/bland-ai/calls' },
      { id: 'settings', label: 'Settings', href: '#/bland-ai/settings' },
      { id: 'analytics', label: 'Analytics', href: '#/bland-ai/analytics' },
      { id: 'searchBarCustomization', label: 'Search Bar Customization', href: '#/search-bar-customization' }
    ];

    submenuItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'submenu-item px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer';
      li.textContent = item.label;
      li.onclick = () => {
        window.location.hash = item.href;
        this.hideSubMenu();
      };
      subMenu.appendChild(li);
    });

    mainMenu.appendChild(subMenu);

    // Append to master dashboard menu container
    const menuContainer = document.getElementById('master-dashboard-menu');
    if (menuContainer) {
      menuContainer.appendChild(mainMenu);
    }

    // Event listeners for submenu toggle
    mainMenu.addEventListener('mouseenter', () => this.showSubMenu());
    mainMenu.addEventListener('mouseleave', () => this.hideSubMenu());
  }

  showSubMenu() {
    const subMenu = document.getElementById(this.subMenuId);
    if (subMenu) {
      subMenu.classList.remove('hidden');
    }
  }

  hideSubMenu() {
    const subMenu = document.getElementById(this.subMenuId);
    if (subMenu) {
      subMenu.classList.add('hidden');
    }
  }
}

// Initialize Bland AI menu on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new BlandAIMenu();
});
