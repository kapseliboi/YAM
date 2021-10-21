/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * !!! IMPORTANT !!!
 * In preload files it is not possible to use some elements
 * of the electron module including app. This also prevents
 * importing modules that use app (or other unusable items)
 */

// Public modules from npm
import { contextBridge } from "electron";

// Local modules
import { IRendererIPCHandler, IRendererLogger } from "../../../modules/interfaces";
import RendererIPCHandler from "../../renderer-ipc-handler";

// Create a handler that will manage the logic
// of the methods passed via ContextBridge
const handler = new RendererIPCHandler();

/**
 * Since it is not possible to pass the classes directly
 * in the ContextBridge because they are executed in a
 * separate context (so this is divertso, the imports are
 * not detected and the class prototype is not passed),
 * wrapper objects are created that will allow you to use
 * the functions of the classes.
 */

const handlerWrapper: IRendererIPCHandler = {
  configure: () => handler.configure(),
  send: (c: string, args: any[]) => handler.send(c, ...args),
  receive: (c: string, f: Function) => handler.receive(c, f),
  invoke: (c: string, args: any[]) => handler.invoke(c, ...args)
};

const loggerWrapper: IRendererLogger = {
  info: (m: string, id?: number) => handler.logger.info(m, id),
  warn: (m: string, id?: number) => handler.logger.warn(m, id),
  error: (m: string, id?: number) => handler.logger.error(m, id)
};

// Expose the following objects to the render process
contextBridge.exposeInMainWorld("API", {
  Handler: handlerWrapper,
  Logger: loggerWrapper
});
