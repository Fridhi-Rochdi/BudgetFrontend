import { generatedEnvironment } from './environment.generated';

export const environment = {
  production: generatedEnvironment.production ?? true,
  apiUrl: generatedEnvironment.apiUrl
};
