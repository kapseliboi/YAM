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
    window.EM.onerror("um-renderer.js", {
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
    window.EM.unhandlederror("um-renderer.js", error.reason);
};

//#region Global variables
let _url, _folder;
//#endregion Global variables

window.API.once("window-arguments", async function onWindowArguments(args) {
    // Translate the DOM
    await translateElementsInDOM()
        .catch(e => window.API.reportError(e, "12500", "translateElementsInDOM", "onWindowArguments"));

    // Set the data
    const translation = await window.API.translate("UM description", {
        "title": args.title, 
        "version": args.version
    });
    document.getElementById("um-description").textContent = translation;
    document.getElementById("um-changelog").textContent = args.changelog;

    // Set global variables
    _url = args.url;
    _folder = args.folder;
});

//#region Events
document.querySelector("#um-close-btn").addEventListener("click", function close() {
    // Close the dialog without updating
    window.API.send("window-close", false);
});

document.querySelector("#um-download-btn").addEventListener("click", function openDownloadLink() {
    // Open the thread link on F95Zone
    window.API.send("open-link", _url);
});

document.querySelector("#um-open-folder-btn").addEventListener("click", function openGameFolder() {
    // Open the folder of the game
    window.API.send("open-link", _folder);
});

document.querySelector("#um-finalize-btn").addEventListener("click", function finalizeUpdate() {
    window.API.send("window-close", true);
});
//#endregion Events

//#region Private methods
/**
 * @private
 * Translate the DOM elements in the current language.
 */
async function translateElementsInDOM() {
    // Get only the localizable elements
    const elements = document.querySelectorAll(".localizable");

    // Translate elements
    for (const e of elements) {
        // Select the element to translate (the last child or the element itself)
        const toTranslate = e.lastChild ?? e;
        toTranslate.textContent = await window.API.translate(e.id);
    }
}
//#endregion Private methods
