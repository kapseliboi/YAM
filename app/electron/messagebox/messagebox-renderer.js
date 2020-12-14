"use strict";

/**
 * @event
 * Handles errors generated by the application.
 * @param {String} message Error message
 * @param {String} source File where the error occurred
 * @param {number} lineno Line containing the instruction that generated the error
 * @param {number} colno Column containing the statement that generated the error
 * @param {Error} error Application generated error
 */
window.onerror = function (message, source, lineno, colno, error) {
    window.EM.onerror("messagebox-renderer.js", {
        message: message,
        line: lineno,
        column: colno,
        error: error,
    });
};

/**
 * @event
 * Handles errors generated within non-catched promises.
 * @param {PromiseRejectionEvent} error 
 */
window.onunhandledrejection = function (error) {
    window.EM.unhandlederror("messagebox-renderer.js", error.reason);
};

//#region Private methods
/**
 * Prepare the window.
 * @param {Object} args Arguments for the window
 * @param {String} args.title Title of the window
 * @param {String} args.message Message to show in the window
 * @param {String} args.type Type of messagebox: `error`/`warning`/`info`
 * @param {Object} args.buttons List of properties for the buttons to add to the window
 * @param {Object} args.checkboxes List of properties for the checkboxes to add to the window
 */
async function prepare(args) {
    // Set the data
    document.getElementById("title").textContent = args.title;
    document.getElementById("message").textContent = args.message;

    // Set the window icon
    await setIcon(args.type)
        .catch(e => window.API.reportError(e, "11400", "setIcon", "prepare", `Type: ${args.type}`));

    // Create the buttons
    const buttonsContainer = document.querySelector(".buttons-container");
    const buttons = await createButtons(args.buttons)
        .catch(e => window.API.reportError(e, "11401", "createButtons", "prepare", `Buttons: ${args.buttons}`));
    buttonsContainer.append(...buttons);

    // Create the checkboxes
    if (args.checkboxes) {createCheckboxes;
        const checkContainer = document.querySelector(".checkboxes-container");
        const checkboxes = await createCheckboxes(args.checkboxes)
            .catch(e => window.API.reportError(e, "11402", "createCheckboxes", "prepare", `Checkboxes: ${args.checkboxes}`));
        checkContainer.append(...checkboxes);
    }

    // Resize window to fit content
    fitContent();
    fitContent(); // TODO: Two times because the first time the styles are not computed
}

//#region Size
/**
 * @private
 * Obtains the size of the buttons container.
 */
function getButtonsAreaSize() {
    // Local variables
    const container = document.querySelector(".container");
    const buttonsContainer = container.querySelector(".buttons-container");

    // The content is 90% of the max width so MaxWindowSize : 100 = ContentWidth : 90
    // 700 is the max window width defined in app/src/scripts/window-creator.js
    const MAX_CONTENT_WIDTH = Math.floor((700 * 90) / 100);
    
    let width = 0,
        height = 0,
        rowWidth = 0;
    for (const button of buttonsContainer.querySelectorAll("a.btn")) {
        rowWidth += button.scrollWidth;

        // Set the height for at least one row of buttons
        if (height === 0) height = button.scrollHeight;

        if (rowWidth > MAX_CONTENT_WIDTH) {
            // Set the container width
            width = Math.max(rowWidth, width);

            // All the buttons have the same height (36px)
            height += button.scrollHeight;

            // Reset the single line width
            rowWidth = 0;
        }
    }

    return {
        height: height,
        width: Math.min(width, MAX_CONTENT_WIDTH),
    };
}

/**
 * @private
 * Obtains the size of the checkboxes container.
 */
function getCheckboxesAreaSize() {
    // Local variables
    const container = document.querySelector(".container");
    const checkboxesContainer = container.querySelector(".checkboxes-container");
    
    // The content is 90% of the max width so MaxWindowSize : 100 = ContentWidth : 90
    // 700 is the max window width defined in app/src/scripts/window-creator.js
    const MAX_CONTENT_WIDTH = Math.floor((700 * 90) / 100);

    let width = 0,
        height = 0;

    for (const checkbox of checkboxesContainer.querySelectorAll("label")) {
        // The checkboxes are arranged on a single column
        width = Math.max(checkbox.scrollWidth, width);
        height += checkbox.scrollHeight;
    }
    return {
        width: Math.min(width, MAX_CONTENT_WIDTH),
        height: height,
    };
}

/**
 * Resize the window to fit the content of the body.
 */
function fitContent() {
    // Get the elements in the page
    const container = document.querySelector(".container");
    const header = container.querySelector(".header");
    const roundedContainer = container.querySelector(".rounded-container");

    // Get the size of the computed elements in the page
    const headerSize = {
        width: header.scrollWidth,
        height: header.scrollHeight,
    };
    const roundedContainerSize = {
        width: roundedContainer.scrollWidth,
        height: roundedContainer.scrollHeight,
    };
    const buttonsAreaSize = getButtonsAreaSize();
    const checkboxesAreaSize = getCheckboxesAreaSize();

    // Calculate the final sizes
    const PADDING = 10;
    const partialWidth = Math.max(headerSize.width,
        roundedContainerSize.width,
        buttonsAreaSize.width,
        checkboxesAreaSize.width);
    const height = headerSize.height + roundedContainerSize.height +
        buttonsAreaSize.height + checkboxesAreaSize.height +
        4 * PADDING; // 3 * "PADDING_TOP" + 1 * "PADDING_BOTTOM"

    // The container (with class "container") has a width of 90%
    // So the real width => partialWidth : 90% = realWidth : 100%
    const realWidth = Math.ceil((partialWidth * 10) / 9);

    window.API.send("window-resize", realWidth, height);
}
//#endregion Size

//#region Buttons
/**
 * Send an IPC message to the main process by returning 
 * the button pressed by the user and the selected checkboxes.
 * @param {MouseEvent} e 
 */
function onButtonClick(e) {
    // Get all the selected checkboxes
    const css = "input[type='checkbox'][checked='checked']";
    const checkboxes = document.querySelectorAll(css);
    const selected = Array.from(checkboxes).map(c => c.id);

    // Return value
    const dict = {
        button: e.target.id,
        checkboxes: selected
    };
    window.API.send("window-close", dict);
}

/**
 * @private
 * Create a basic buttons with the specified ID
 * @param {String} id 
 */
function createBaseButton(id) {
    // Create base button
    const button = document.createElement("a");
    button.classList.add("waves-effect", "waves-light", "btn", "truncate");
    button.id = id;
    button.onclick = onButtonClick;
    return button;
}

/**
 * @private
 * Create a button with the specified options.
 * @param {HTMLAnchorElement} button Basic button
 * @param {Object} options Options for the button
 */
async function createDefaultButton(button, options) {
    button.text = await window.API.translate(`default-button-${options.name}`);
    button.style.color = options.color;
    button.style.backgroundColor = options.background;
    button.classList.add(...options.classes);
    return button;
}

/**
 * @private
 * Create a buttons with the given options.
 * @param {Object[]} options Options for the specific button
 * @param {Object} defaults Dictionary of default options for the buttons
 */
async function createButton(options, defaults) {
    // Create base button
    let button = createBaseButton(options.name);

    // Create base icon
    const icon = document.createElement("i");
    icon.classList.add("material-icons", "left");

    // Is the button a default one?
    const isDefault = Object.keys(defaults).includes(options.name);
    if (isDefault) {
        // Set the default data
        const defaultData = defaults[options.name];
        button = await createDefaultButton(button, defaultData);
        icon.classList.add(`md-${defaultData.icon}`);
    }

    // Set the button's options, if the button is a default button
    // the previous settings will be overwritten
    button.text = options.text ?? button.text;
    button.style.color = options.color ?? button.style.color;
    button.style.backgroundColor = options.background ?? button.style.backgroundColor;
    if (options.classes) button.classList.add(...options.classes);
    if (options.icon) icon.classList.add(`md-${options.icon}`);

    // Add the icon to the button as first child
    button.prepend(icon);
    return button;
}

/**
 * Create a list of buttons to add to the DOM.
 * @param {Object[]} options Options for a button
 * @param {String} options.name 
 * Name of the button, it will be returned when the user click on it. 
 * If it's a default name the others properties will be automatically set.
 * Default names are: `close`, `remove-only`, `delete`, `cancel`, `update`, `report-issue`, `quit`.
 * @param {String} [options.text] 
 * The text to show on the button.  
 * Overwrite the `default` options if specified.
 * @param {String} [options.color] 
 * Hexadecimal color of the text for the button.
 * Overwrite the `default` options if specified.
 * @param {String} [options.background] 
 * Hexadecimal color of the background of the button.
 * Overwrite the `default` options if specified.
 * @param {String} [options.icon] 
 * Name of the icon to be shown on the left of the 
 * button chosen from the material design icons.
 * Overwrite the `default` options if specified.
 * @param {String[]} [options.classes] 
 * List of CSS classes to add to the button.
 * Overwrite the `default` options if specified.
 * @returns List of buttons to add to the page
 */
async function createButtons(options) {
    // Load the file containing the data for the default buttons
    const cwd = await window.API.cwd();
    const path = window.API.join(cwd, "resources", "default-buttons.json");
    const data = await window.IO.read(path);
    const defaults = JSON.parse(data);

    // Create and return the buttons
    const promises = options.map((o) => createButton(o, defaults));
    return Promise.all(promises);
}
//#endregion Buttons

/**
 * Set a icon for the type of messagebox.
 * @param {String} type `error`/`warning`/`info`
 */
async function setIcon(type) {
    // Local variables
    const cwd = await window.API.cwd();
    const imagesPath = window.API.join(cwd, "resources", "images");
    const iconElement = document.getElementById("icon");
    const iconName = {
        info: "info.webp",
        warning: "warning.webp",
        error: "error.webp"
    };

    // Check if the icon is valid
    const valid = Object.keys(iconName).includes(type);
    if (!valid) throw new Error(`${type} is a invalid type icon`);

    // Set icon
    iconElement.setAttribute("src", window.API.join(imagesPath, iconName[type]));
}

/**
 * Create a list of checkboxes to add to the DOM.
 * @param {Object[]} options Options for a checkbox
 * @param {String} options.name
 * Name of the checkbox, it will be returned when the user click 
 * on a button if it is checked. 
 * If it's a default name the others properties will be automatically set.
 * Default names are: `preserve-savegame`.
 * @param {String} [options.text]
 * The text to show on the checkbox.  
 * Overwrite the `default` options if specified.
 * @param {Boolean} [options.checked]
 * The value assumed by the checkbox.
 * Overwrite the `default` options if specified.
 * @returns List of checkboxes to add to the page
 */
async function createCheckboxes(options) {
    // Local variables
    const defaultCheckboxes = ["preserve-savegame"];
    const checkboxes = [];

    // Load the file containing the data for the default buttons
    const cwd = await window.API.cwd();
    const path = window.API.join(cwd, "resources", "default-checkboxes.json");
    const data = await window.IO.read(path);
    const defaults = JSON.parse(data);

    // A checkbox is defined as:
    /*
    <label>
        <input type="checkbox" checked="checked" />
        <span>Yellow</span>
    </label>
    */

    for(const o of options) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.id = o.name;
        const span = document.createElement("span");

        // Is the checkbox a default one?
        if (defaultCheckboxes.includes(o.name)) {
            const defaultData = defaults[o.name];

            // Set the default data
            span.innerText = await window.API.translate(`default-checkbox-${defaultData.name}`);
            const checked = defaultData.checked ? "checked" : "";
            input.setAttribute("checked", checked);
        }

        // Set the checkbox's options, if the checkbox is a 
        // default checkbox the previous settings will be overwritten
        if (o.text) span.innerText = o.text;
        if (o.checked !== undefined) {
            const checked = o.checked ? "checked" : "";
            input.setAttribute("checked", checked);
        }

        // Prepare the checkbox
        label.append(input, span);
        checkboxes.push(label);
    }
    return checkboxes;
}
//#endregion Private methods

//#region IPC

window.API.once("window-arguments", function (args) {
    window.requestAnimationFrame(() => prepare(args));
});

//#endregion IPC
