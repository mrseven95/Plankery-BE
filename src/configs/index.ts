import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { redisConfig } from './redis.config';

export const configuration = () => ({
  ...appConfig(),
  ...databaseConfig(),
  ...jwtConfig(),
  ...redisConfig(),
});
