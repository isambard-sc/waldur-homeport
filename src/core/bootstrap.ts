import Axios from 'axios';

import { afterBootstrap } from '@waldur/afterBootstrap';
import { ENV } from '@waldur/configs/default';

const CONFIG_FILE = 'scripts/configs/config.json';

export async function loadConfig() {
  let frontendSettings, backendSettings, roles;
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

    const rolesResponse = await Axios.get(
      `${frontendSettings.apiEndpoint}api/roles/`,
    );
    roles = rolesResponse.data;
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

  const config = {
    ...frontendSettings,
    plugins: backendSettings,
    languageChoices: backendSettings.LANGUAGES.map(([code, label]) => ({
      code,
      label,
    })),
    defaultLanguage: backendSettings.LANGUAGE_CODE,
    FEATURES: backendSettings.FEATURES,
    permissions: roles.reduce(
      (result, item) => ({ ...result, [item.name]: item.permissions }),
      {},
    ),
  };
  Object.assign(ENV, config);
  afterBootstrap();
  return true;
}
