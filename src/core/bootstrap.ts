import Axios from 'axios';

import { getRoles } from '@waldur/administration/roles/api';
import { afterBootstrap } from '@waldur/afterBootstrap';
import { ENV } from '@waldur/configs/default';

const CONFIG_FILE = 'scripts/configs/config.json';

export async function loadConfig() {
  let frontendSettings, backendSettings;
  try {
    const frontendResponse = await Axios.get(CONFIG_FILE);
    frontendSettings = frontendResponse.data;
  } catch (error) {
    if (!error) {
      throw new Error(`Unable to fetch client configuration file.`);
    } else if (error.response?.status === 404) {
      // fallback to default configuration
      frontendSettings = {
        apiEndpoint: 'http://localhost:8080/',
      };
    } else {
      throw new Error(error);
    }
  }

  // Axios swallows JSON parse error
  if (typeof frontendSettings !== 'object') {
    throw new Error(
      `Unable to parse client configuration file ${CONFIG_FILE}.`,
    );
  }

  try {
    const backendResponse = await Axios.get(
      `${frontendSettings.apiEndpoint}api/configuration/`,
    );
    backendSettings = backendResponse.data;
  } catch (error) {
    if (!error) {
      throw new Error(
        `Unfortunately, connection to server has failed. Please check if you can connect to ${frontendSettings.apiEndpoint} from your browser and contact support if the error continues.`,
      );
    } else if (error.response?.status >= 400) {
      throw new Error(
        `Unable to fetch server configuration. Error message: ${error.statusText}`,
      );
    } else {
      throw new Error(error);
    }
  }

  const languageLabels = backendSettings.LANGUAGES.reduce(
    (result, [code, label]) => ({
      ...result,
      [code]: label,
    }),
    {},
  );

  const config = {
    ...frontendSettings,
    plugins: backendSettings,
    languageChoices: backendSettings.LANGUAGES.map(
      (language) => language[0],
    ).map((code) => ({
      code,
      label: languageLabels[code],
    })),
    defaultLanguage: backendSettings.LANGUAGE_CODE,
    FEATURES: backendSettings.FEATURES,
  };
  Object.assign(ENV, config);
  try {
    const roles = await getRoles();
    ENV.roles = roles;
  } catch (error) {
    throw new Error(`Unable to fetch user roles.`);
  }
  afterBootstrap();
  return true;
}
