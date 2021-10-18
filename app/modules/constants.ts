// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import { join } from "path";

// Public modules from npm
import { app } from "electron";

/**
 * Per-user application data directory, which by default points to:
 * - `%APP_DATA%` on Windows
 * - `$XDG_CONFIG_HOME` or `~/.config` on Linux
 * - `~/Library/Application Support` on macOS
 */
const APP_DATA = app.getPath("appData");

/**
 * Path to the directory that contains the log files.
 */
const APP_LOGS_DIR = app.getPath("logs");

/**
 * Get the current working directory (the directory that contains app.ts).
 */
const APP_PATH = app.getAppPath();

/**
 * Path to assets.
 */
const ASSETS_PATH = join(APP_PATH, "dist", "assets");

/**
 * Paths to files or resources used in this application.
 */
export const Paths = {
  /**
   * Object that collects all log file paths.
   */
  LogPath: {
    /**
     * Path of the log file where all uncategorized information will be written.
     */
    DEFAULT: join(APP_LOGS_DIR, "default.log"),
    /**
     * Path to the log file that records all information about the main process.
     */
    MAIN: join(APP_LOGS_DIR, "main.log"),
    /**
     * Path to the log file that records all information about the window renderer process.
     */
    RENDERER: join(APP_LOGS_DIR, "renderer.log"),
    /**
     * Path to the log file that records all information of the F95API library.
     */
    F95API: join(APP_LOGS_DIR, "f95api.log")
  },
  /**
   * Object that collects all database's paths.
   */
  DatabasePath: {
    /**
     * Path to the database that contains the data of the installed games.
     */
    GAMES: join(APP_DATA, "db", "games.json"),
    /**
     * Path to the database that contains the data of the watched threads.
     */
    THREADS: join(APP_DATA, "db", "threads.json"),
    /**
     * Path to the database that contains the data of the installed mods and the overwrite data.
     */
    MODS: join(APP_DATA, "db", "mods.json")
  },
  /**
   * Path to the directory that contains all the window's scripts used in the application.
   */
  WINDOWS_SCRIPTS_PATH: join(APP_PATH, "dist", "renderer", "windows"),

  /**
   * Path to the directory that contains all the window's HTML scripts.
   */
  WINDOWS_HTML_PATH: join(ASSETS_PATH, "windows"),

  /**
   * Path to this application's icon (`ico` file).
   */
  APP_ICON: join(APP_PATH, "resources", "images", "icon.ico")
};

/**
 * Object that collects all log file paths.
 */
export const LogPath = {
  /**
   * Path of the log file where all uncategorized information will be written.
   */
  DEFAULT: join(APP_LOGS_DIR, "default.log"),
  /**
   * Path to the log file that records all information about the main process.
   */
  MAIN: join(APP_LOGS_DIR, "main.log"),
  /**
   * Path to the log file that records all information about the window renderer process.
   */
  RENDERER: join(APP_LOGS_DIR, "renderer.log"),
  /**
   * Path to the log file that records all information of the F95API library.
   */
  F95API: join(APP_LOGS_DIR, "f95api.log")
};

/**
 * Object that collects all database's paths.
 */
export const DatabasePath = {
  /**
   * Path to the database that contains the data of the installed games.
   */
  GAMES: join(APP_DATA, "db", "games.json"),
  /**
   * Path to the database that contains the data of the watched threads.
   */
  THREADS: join(APP_DATA, "db", "threads.json"),
  /**
   * Path to the database that contains the data of the installed mods and the overwrite data.
   */
  MODS: join(APP_DATA, "db", "mods.json")
};

/**
 * An object that contains all the colors used by the application.
 */
export const Colors = {
  /**
   * Application base color used when loading a window.
   */
  BASE: "#262626"
};

/**
 * An object that contains the minimum size of the application `BrowserWindow`.
 */
export const WindowMinimumSize = {
  /**
   * Minimum size of the main window.
   */
  MAIN: { width: 1024, height: 620 }
};
