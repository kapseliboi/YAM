// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import type { Configuration, Appender, Layout, Logger } from "log4js";
import { configure, getLogger } from "log4js";

// Local modules
import type { TLoggerCategory } from "../../../common/types";
import shared from "../../../common/shared";

//#region Global variables
let initialized = false;

/**
 * Common layout of the loggers.
 */
const LAYOUT: Layout = {
  type: "pattern",
  pattern: "[%d{yyyy/MM/dd-hh.mm.ss}] (%p - %c) %m"
};
//#endregion Global variables

//#region Private methods
/**
 * Create a standard appender that writes to the path passed by parameter.
 * @param filename Path to write log to
 */
function createCommonAppender(filename: string): Appender {
  return {
    type: "file", // Write log to file
    filename: filename, // Write to log to
    layout: LAYOUT, // Use the common layout for messages
    keepFileExt: true, // Use filename.1.log instead of filename.log.1
    maxLogSize: 10485760, // 10 MB
    backups: 3, // Keep max 3 files (for this appender)
    compress: true // Compress the files in .gz after they reach 10 MB
  };
}
//#endregion Private methods

//#region Public methods
/**
 * Initialize the loggers for the current session.
 */
export function init(): void {
  // Create the appenders
  const DEFAULT_APPENDER: Appender = createCommonAppender(shared.paths.LogPath.DEFAULT());
  const MAIN_APPENDER: Appender = createCommonAppender(shared.paths.LogPath.MAIN());
  const RENDERER_APPENDER: Appender = createCommonAppender(shared.paths.LogPath.RENDERER());
  const F95_APPENDER: Appender = createCommonAppender(shared.paths.LogPath.F95API());

  // Set the level for the appenders
  const level = shared.isDev ? "debug" : "warn";

  // Create the configuration object
  const configuration: Configuration = {
    appenders: {
      default: DEFAULT_APPENDER,
      main: MAIN_APPENDER,
      renderer: RENDERER_APPENDER,
      f95: F95_APPENDER
    },
    categories: {
      default: {
        appenders: ["default"],
        level: "debug"
      },
      main: {
        appenders: ["main"],
        level: level
      },
      renderer: {
        appenders: ["renderer"],
        level: level
      },
      f95: {
        appenders: ["f95"],
        level: level
      }
    }
  };

  // Load the configuration
  configure(configuration);
  initialized = true;
}

/**
 * Gets the logger with the requested category.
 */
export function get(category: TLoggerCategory): Logger {
  if (!initialized) throw new Error("Loggers not initiailized");

  return getLogger(category);
}
//#endregion Public methods