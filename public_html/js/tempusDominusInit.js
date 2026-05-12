/*
 * This file is part of MedShakeEHR.
 *
 * Copyright (c) 2026
 * Michaël Val
 * https://www.brunoy-osteopathe.fr/
 *
 * MedShakeEHR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * MedShakeEHR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MedShakeEHR.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Tempus Dominus v6+ Central Manager
 * Replaces eonasdan/datepicker (v4) with Tempus Dominus (v6+)
 *
 * Init auto : uniquement les div.datepick (compta, roulette obst., champs datés formulaires).
 * Clic sur l’input ou l’icône : remonte au conteneur où TD appelle toggle() (allowInputToggle false).
 * 
 * @author Michaël Val
 * @version 6.0
 */

// Global storage for Tempus Dominus instances
window.tempusInstances = new Map();

/**
 * Initialize a Tempus Dominus instance for a given element
 * Valid option names (top level):
 * - localization: { locale, format, hourCycle, ... }
 * - display: { icons, components, viewMode, placement, ... }
 * - restrictions: { minDate, maxDate, disabledDates, ... }
 * - allowInputToggle, keepInvalid, dateRange, multipleDates, etc.
 * 
 * @param {HTMLElement} element - The container element
 * @param {Object} options - Configuration options
 * @returns {tempusDominus.TempusDominus} - The picker instance
 */
function initTempusInstance(element, options = {}) {
    if (!element) return null;

    const elementId = element.id || 'temp_' + Math.random().toString(36).substr(2, 9);
    if (!element.id) element.id = elementId;

    // IMPORTANT: Si une instance existe déjà pour cet ID (cas des modals fermées puis rouvertes),
    // on DOIT la détruire (dispose) pour nettoyer le DOM (widgets fantômes) et les events listeners.
    if (window.tempusInstances.has(elementId)) {
        destroyTempusInstance(elementId);
    }

    // allowInputToggle: false était pour éviter le bug de double toggle, mais avec les bons attributs data-td, 
    // on peut laisser la configuration par défaut.
    let config = {
        localization: {
            locale: 'fr',
            format: 'dd/MM/yyyy'
        },
        useCurrent: false,
        allowInputToggle: true
        // container is deliberately omitted to allow default Popper.js positioning on the body
        // appending to the input-group (flex container) caused the icon to stretch.
    };

    // Modification du DOM pour correspondre EXACTEMENT à la structure attendue par Tempus Dominus v6
    // Cela évite tous les bugs de "cliquable une fois" ou "ouvre et se ferme immédiatement"
    element.setAttribute('data-td-target-input', 'nearest');
    element.setAttribute('data-td-target-toggle', 'nearest');

    const input = element.querySelector('input');

    // Look specifically for the append container or the last text element
    // to avoid attaching the toggle to a .input-group-prepend text.
    let iconSpan = element.querySelector('.input-group-append');
    if (!iconSpan) {
        const texts = element.querySelectorAll('.input-group-text');
        if (texts.length > 0) {
            iconSpan = texts[texts.length - 1];
        }
    }

    if (input) {
        input.setAttribute('data-td-target', '#' + elementId);
    }
    if (iconSpan) {
        iconSpan.setAttribute('data-td-target', '#' + elementId);
        iconSpan.setAttribute('data-td-toggle', 'datetimepicker');
    }

    // Merge user-provided options carefully, only at top level
    for (const key in options) {
        if (options.hasOwnProperty(key)) {
            if (key === 'localization') {
                // Merge localization options
                config.localization = { ...config.localization, ...options.localization };
            } else if (key === 'display' || key === 'restrictions') {
                // These can have nested properties
                config[key] = options[key];
            } else {
                // Top-level option (allowInputToggle, keepInvalid, etc.)
                config[key] = options[key];
            }
        }
    }

    // Create instance
    try {
        const instance = new tempusDominus.TempusDominus(element, config);

        // Store instance globally for later access
        window.tempusInstances.set(elementId, instance);

        return instance;
    } catch (e) {
        return null;
    }
}

/**
 * Get a Tempus Dominus instance by element ID or element
 * @param {string|HTMLElement} idOrElement - Element ID or DOM element
 * @returns {tempusDominus.TempusDominus|null} - The instance or null
 */
function getTempusInstance(idOrElement) {
    if (idOrElement && typeof idOrElement.jquery === 'string') {
        idOrElement = idOrElement[0];
    }
    if (typeof idOrElement === 'string') {
        return window.tempusInstances.get(idOrElement) || null;
    }
    if (idOrElement instanceof HTMLElement) {
        return window.tempusInstances.get(idOrElement.id) || null;
    }
    return null;
}

/**
 * Destroy a Tempus Dominus instance
 * @param {string|HTMLElement} idOrElement - Element ID or DOM element
 */
function destroyTempusInstance(idOrElement) {
    const instance = getTempusInstance(idOrElement);
    if (instance) {
        instance.dispose();
        const id = typeof idOrElement === 'string' ? idOrElement : idOrElement.id;
        window.tempusInstances.delete(id);
    }
}

/**
 * Re-initialize a Tempus Dominus instance
 * @param {HTMLElement} element - The container element
 * @param {Object} options - Configuration options
 * @returns {tempusDominus.TempusDominus} - The new instance
 */
function reinitTempusInstance(element, options = {}) {
    destroyTempusInstance(element);
    return initTempusInstance(element, options);
}

/**
 * Initialize all .datepick elements on page
 * Called automatically on DOM ready
 */
function initAllDatepickers() {
    const datepickers = document.querySelectorAll('div.datepick:not([data-tempus-init])');
    datepickers.forEach(element => {
        const instance = initTempusInstance(element);
        if (instance) {
            element.setAttribute('data-tempus-init', 'true');
        }
    });
}

/**
 * Watch for dynamically added datepickers and initialize them
 */
function observeNewDatepickers() {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // Element node
                        const datepickers = node.querySelectorAll ? node.querySelectorAll('div.datepick:not([data-tempus-init="true"])') : [];
                        datepickers.forEach(element => {
                            if (!element.hasAttribute('data-tempus-init')) {
                                initTempusInstance(element);
                                element.setAttribute('data-tempus-init', 'true');
                            }
                        });
                        // Also check if added node itself is a datepicker
                        if (node.classList && node.classList.contains('datepick') && !node.hasAttribute('data-tempus-init')) {
                            initTempusInstance(node);
                            node.setAttribute('data-tempus-init', 'true');
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Helper: Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

/**
 * Helper: Check if value is object
 * @param {*} item - Value to check
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Helper: Parse date string or Date object to Date
 * Supports: 'YYYY-MM-DD', 'DD/MM/YYYY', ISO string, or Date object
 * @param {string|Date} dateInput - Date to parse
 * @returns {Date|null} - Parsed date or null
 */
function parseDate(dateInput) {
    if (dateInput instanceof Date) {
        return dateInput;
    }
    if (typeof dateInput === 'string') {
        // Try ISO format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            return new Date(dateInput + 'T00:00:00');
        }
        // Try DD/MM/YYYY format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
            const parts = dateInput.split('/');
            return new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
        }
        // Try parsing as ISO
        const parsed = new Date(dateInput);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    return null;
}

/**
 * Helper: Format Date to 'DD/MM/YYYY' string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDateFR(date) {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Helper: Get day difference in years (for age calculation)
 * @param {Date} birthDate - Birth date
 * @param {Date} referenceDate - Reference date (default: today)
 * @returns {number} - Age in years
 */
function getAgeDifference(birthDate, referenceDate = new Date()) {
    if (!(birthDate instanceof Date) || isNaN(birthDate)) return 0;

    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

// Disable Bootstrap Modal enforceFocus to allow Tempus Dominus v6 to work properly
// Since TD v6 appends its widget to the body, Bootstrap's enforceFocus will immediately close it
// on subsequent clicks or interactions if not disabled.
if (typeof jQuery !== 'undefined' && jQuery.fn && jQuery.fn.modal) {
    if (jQuery.fn.modal.Constructor && jQuery.fn.modal.Constructor.prototype) {
        // Bootstrap 4
        jQuery.fn.modal.Constructor.prototype._enforceFocus = function () { };
    }
}

// Global click interceptor to prevent opening datepickers if the input is readonly
// This restores Eonasdan's default behavior where readonly inputs do not trigger the picker
document.addEventListener('click', function (e) {
    // Check if clicking on a toggle icon
    let toggle = e.target.closest('[data-td-toggle="datetimepicker"]');
    if (toggle) {
        let targetSelector = toggle.getAttribute('data-td-target');
        if (targetSelector) {
            let container = document.querySelector(targetSelector);
            if (container) {
                let input = container.querySelector('input');
                if (input && input.readOnly) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return;
                }
            }
        }
    }

    // Check if clicking directly on the input (allowInputToggle)
    let inputTarget = e.target.closest('input[data-td-target]');
    if (inputTarget && inputTarget.readOnly) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
}, true); // Use capture phase to run before Tempus Dominus event listeners

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        initAllDatepickers();
        observeNewDatepickers();
    });
} else {
    // DOM is already loaded (e.g., if this script is deferred and runs late)
    initAllDatepickers();
    observeNewDatepickers();
}
