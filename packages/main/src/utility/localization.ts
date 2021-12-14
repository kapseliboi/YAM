// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import fs from "fs/promises";
import path from "path";

// Public modules from npm
import type { Module, Resource, ResourceLanguage, TOptions } from "i18next";
import LanguageDetector from "i18next-electron-language-detector";
import i18next from "i18next";

// Local modules
import shared from "../../../common/shared";

/**
 * Initialize the translation for the app.
 * @param resourcesPath Path to the directory containing the translation files
 * @param language ISO code of the language
 */
export async function initLocalization(resourcesPath: string, language?: string): Promise<void> {
  // Obtain the translation files
  const res = await getTranslationResourcesFromDir(resourcesPath);

  // Initialize class
  await i18next.use(LanguageDetector as Module).init({
    resources: res,
    fallbackLng: shared.isDev ? "dev" : "en"
  });

  // If defined, change language
  if (language) await changeLanguage(language);
}

/**
 * Obtain the current language ISO code.
 * @return ISO code for the current language
 */
export function getCurrentLanguage(): string {
  return i18next.language;
}

/**
 * Translate a string.
 * @param key Key to use in the translation
 * @param interpolation Dictionary containing the interpolation key and the value to interpolate
 */
export function getTranslation(key: string, interpolation?: string | TOptions<object>): string {
  return interpolation ? i18next.t(key, interpolation) : i18next.t(key);
}

/**
 * Change the current language.
 * @param lang ISO code of the new language
 */
export async function changeLanguage(lang: string): Promise<void> {
  await i18next.changeLanguage(lang);
}

//#region Private methods
/**
 * Obtain the list of translation file in the specified directory.
 * @param dirname Directory containing the translations
 */
async function getTranslationResourcesFromDir(dirname: string) {
  // Resolve the path to the resources
  const dir = path.resolve(dirname);

  // Read all the files in the dir
  const dirents = await fs.readdir(path.resolve(dir), {
    withFileTypes: true
  });
  const files = dirents
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json"))
    .map((dirent) => dirent.name);

  // Parse all the paths
  const paths = files.map((filename) => path.join(dir, filename));

  // Read translations
  const promises = paths.map(async (p) => {
    // Read and parse file
    const json = await fs.readFile(p, { encoding: "utf-8" });
    const data = JSON.parse(json) as ResourceLanguage;
    const languageISO = path.basename(p, ".json");

    return {
      key: languageISO,
      resource: data
    };
  });
  const parsed = await Promise.all(promises);

  // Add translations to dictionary
  const resources: Resource = {};
  parsed.map((data) => (resources[data.key] = data.resource));
  return resources;
}
//#endregion Private methods