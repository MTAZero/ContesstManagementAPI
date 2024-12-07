import 'dotenv/config'

export interface IDatabaseConfig {
  host: string;
  port: number;
  uri: string;
}

export const databaseConfig = (): IDatabaseConfig => ({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  uri: process.env.DATABASE_URI,
});

export interface IAppConfig {
  port: number;
  jwt_key: string;
}

export interface timestampConfig {
  timestamp_2100: number;
}

export const appConfig = (): IAppConfig => ({
  port: parseInt(process.env.PORT),
  jwt_key: process.env.JWT_SECRET_KEY,
});

export interface IArchiveConfig {
  folder_saved: string;
}

export const archiveConfig = (): IArchiveConfig => ({
  folder_saved: process.env.FOLDER_SAVED
});

export const timestampConfig = () => ({
  timestamp_2100: parseInt(process.env.timestamp_2100),
  timestamp_2000: parseInt(process.env.timestamp_2000)
})
