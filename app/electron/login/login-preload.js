// For more information about secure use of IPC see:
// https://github.com/reZach/secure-electron-template/blob/master/docs/newtoelectron.md

"use strict";

// Core modules
const fs = require("fs");

// Public modules from npm
const { contextBridge, ipcRenderer } = require("electron");
const logger = require("electron-log");

// Modules from file
const errManager = require("../../src/scripts/error-manger.js");

// Array of valid render-to-main channels
const validSendChannels = [
    "window-close",
    "credentials-path",
    "translate",
];

//#region Error management
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
    errManager.manageError("login-preload.js", {
        message: message,
        line: lineno,
        column: colno,
        error: error,
    }, ipcRenderer);
};

/**
 * @event
 * Handles errors generated within non-catched promises.
 * @param {PromiseRejectionEvent} error 
 */
window.onunhandledrejection = function (error) {
    errManager.manageUnhandledError("login-preload.js", error.reason, ipcRenderer);
};
//#endregion Error management

//#region Context Bridge
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("API", {
    /**
     * Send an asynchronous request via IPC and wait for a response.
     * @param {String} channel Communication channel
     * @param {Any[]} data Data to send to main process
     * @returns {Promise<Any>} Result from the main process
     */
    invoke: (channel, ...data) => {
        // Send a custom message
        if (validSendChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
        else logger.warn(`Unauthorized IPC message from 'login-preload.js' through ${channel}: ${data}`);
    },
    /**
     * Send an asynchronous request via IPC.
     * @param {String} channel Communication channel
     * @param {Any[]} data Data to send to main process
     */
    send: (channel, ...data) => {
        // Send a custom message
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
        else logger.warn(`Unauthorized IPC message from 'login-preload.js' through ${channel}: ${data}`);
    },
    /**
     * Translate a key into a message in the language specified by the user.
     * @param {String} key Unique key of the message
     * @param {Object} interpolation Dictionary containing the interpolation values
     * @returns {Promise<String>}
     */
    translate: async function apiTranslate(key, interpolation) {
        return ipcRenderer.invoke("translate", key, interpolation);
    },
    /**
     * Provide access to logger methods.
     */
    log: logger.functions,
    /**
     * Log an error
     * @param {Error} error Throwed error
     * @param {String} code Unique error code
     * @param {String} name Name of the function that throw the error
     * @param {String} parentName Name of the function containing the error throwing function
     * @param {String} message Custom message to add
     */
    reportError: (error, code, name, parentName, message) => errManager.reportError(error, code, name, parentName, message),
});

// Expose the I/O operations
contextBridge.exposeInMainWorld("IO", {
    /**
     * Read data from a file asynchronously.
     * @param {String} path
     * @returns {Promise<String>}
     */
    read: async function ioRead(path) {
        return fs.readFileSync(path, "utf-8");
    },
    /**
     * Write data in a file asynchronously.
     * @param {String} path
     * @param {Any} value
     */
    write: async function ioWrite(path, value) {
        fs.writeFileSync(path, value);
    },
    /**
     * Check if the specified file exists on disk asynchronously.
     * @param {String} filename 
     * @returns {Boolean}
     */
    exists: async function ioFileExists(filename) {
        return fs.existsSync(filename);
    },
});

// Expose methods for error logging
contextBridge.exposeInMainWorld("EM", {
    onerror: (scriptname, data) => errManager.manageError(scriptname, data, ipcRenderer),
    unhandlederror: (scriptname, reason) => errManager.manageUnhandledError(scriptname, reason, ipcRenderer)
});

// Expose the F95API
contextBridge.exposeInMainWorld("F95", {
    /**
     * Login to the F95Zone platform.
     * @param {String} username
     * @param {String} password
     */
    login: (username, password) => ipcRenderer.invoke("f95api", "login", {
            username: username,
            password: password
        })
});
//#endregion Context Bridge
