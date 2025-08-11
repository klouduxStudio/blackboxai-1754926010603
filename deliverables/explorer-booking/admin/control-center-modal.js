// Modal Management
function openRoleModal(roleId = null) {
    const modal = document.getElementById('roleModal');
    const title = document.getElementById('roleModalTitle');
    const form = document.getElementById('roleForm');
    
    if (roleId) {
        title.textContent = 'Edit Role';
        const role = controlCenter.roles[roleId];
        if (role) {
            document.getElementById('roleId').value = roleId;
            document.getElementById('roleName').value = role.name;
            document.getElementById('roleDescription').value = role.description;
            // Set permissions checkboxes
            document.querySelectorAll('#roleForm input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = role.permissions.includes(checkbox.value);
            });
        }
    } else {
        title.textContent = 'Create Role';
        form.reset();
        document.getElementById('roleId').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeRoleModal() {
    document.getElementById('roleModal').classList.add('hidden');
}

function openAttributeModal(attributeId = null) {
    const modal = document.getElementById('attributeModal');
    const title = document.getElementById('attributeModalTitle');
    const form = document.getElementById('attributeForm');
    
    if (attributeId) {
        title.textContent = 'Edit Attribute';
        const entityType = document.querySelector('[onclick^="showAttributeType"]').getAttribute('onclick').match(/'(.+)'/)[1];
        const attribute = controlCenter.customAttributes[entityType].find(attr => attr.id === attributeId);
        if (attribute) {
            document.getElementById('attributeId').value = attributeId;
            document.getElementById('attributeName').value = attribute.name;
            document.getElementById('attributeType').value = attribute.type;
            document.getElementById('attributeDescription').value = attribute.description;
            // Handle select options if applicable
            if (attribute.type === 'select') {
                document.getElementById('selectOptionsContainer').classList.remove('hidden');
                // Populate options
                const optionsList = document.getElementById('optionsList');
                optionsList.innerHTML = '';
                attribute.options.forEach(option => addOption(option));
            }
        }
    } else {
        title.textContent = 'Create Attribute';
        form.reset();
        document.getElementById('attributeId').value = '';
        document.getElementById('selectOptionsContainer').classList.add('hidden');
    }
    
    modal.classList.remove('hidden');
}

function closeAttributeModal() {
    document.getElementById('attributeModal').classList.add('hidden');
}

// Initialize event listeners for modals
document.addEventListener('DOMContentLoaded', () => {
    // Load modals HTML
    fetch('control-center-modals.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('modals-container').innerHTML = html;
            initializeModalHandlers();
        });
});

function initializeModalHandlers() {
    // Role form submission
    document.getElementById('roleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const roleId = document.getElementById('roleId').value;
        const roleData = {
            name: document.getElementById('roleName').value,
            description: document.getElementById('roleDescription').value,
            permissions: Array.from(document.querySelectorAll('#roleForm input[type="checkbox"]:checked'))
                .map(cb => cb.value)
        };

        try {
            if (roleId) {
                controlCenter.updateRole(roleId, roleData);
            } else {
                controlCenter.createRole(generateId(), roleData);
            }
            loadRoles();
            closeRoleModal();
            showNotification(`Role ${roleId ? 'updated' : 'created'} successfully`, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Attribute form submission
    document.getElementById('attributeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const attributeId = document.getElementById('attributeId').value;
        const entityType = document.querySelector('[onclick^="showAttributeType"]').getAttribute('onclick').match(/'(.+)'/)[1];
        const attributeData = {
            name: document.getElementById('attributeName').value,
            type: document.getElementById('attributeType').value,
            description: document.getElementById('attributeDescription').value
        };

        // Handle select options if applicable
        if (attributeData.type === 'select') {
            attributeData.options = Array.from(document.querySelectorAll('#optionsList input'))
                .map(input => input.value)
                .filter(Boolean);
        }

        try {
            if (attributeId) {
                controlCenter.updateCustomAttribute(entityType, attributeId, attributeData);
            } else {
                controlCenter.addCustomAttribute(entityType, attributeData);
            }
            loadCustomAttributes(entityType);
            closeAttributeModal();
            showNotification(`Attribute ${attributeId ? 'updated' : 'created'} successfully`, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Handle attribute type change
    document.getElementById('attributeType').addEventListener('change', (e) => {
        const selectOptionsContainer = document.getElementById('selectOptionsContainer');
        if (e.target.value === 'select') {
            selectOptionsContainer.classList.remove('hidden');
        } else {
            selectOptionsContainer.classList.add('hidden');
        }
    });
}

// Helper function to generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Option management for select attributes
function addOption(value = '') {
    const optionsList = document.getElementById('optionsList');
    const optionDiv = document.createElement('div');
    optionDiv.className = 'flex items-center space-x-2';
    optionDiv.innerHTML = `
        <input type="text" class="flex-1 p-2 border rounded-lg" placeholder="Option value" value="${value}">
        <button type="button" onclick="removeOption(this)" class="text-red-600 hover:text-red-800">
            <i class="fas fa-minus-circle"></i>
        </button>
    `;
    optionsList.appendChild(optionDiv);
}

function removeOption(button) {
    button.closest('div').remove();
}
