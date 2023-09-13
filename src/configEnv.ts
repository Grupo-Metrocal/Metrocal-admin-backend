const common = {
  type: 'postgres',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  retryDelay: 3000,
  retryAttempts: 10,
}

const prod = {
  ...common,
  host: process.env.P_DB_POSTGRES_HOST,
  database: process.env.P_DB_POSTGRES_DB,
  port: parseInt(process.env.P_DB_POSTGRES_PORT),
  password: process.env.P_DB_POSTGRES_PASSWORD,
  username: process.env.P_DB_POSTGRES_USER,
  url: process.env.P_DB_POSTGRES_URL,
  ssl: {
    requestCert: true,
    rejectUnauthorized: false,
  },
}

const dev = {
  ...common,
  host: process.env.DB_POSTGRES_HOST,
  database: process.env.DB_POSTGRES_DB,
  port: parseInt(process.env.DB_POSTGRES_PORT),
  password: process.env.DB_POSTGRES_PASSWORD,
  username: process.env.DB_POSTGRES_USER,
  url: '',
}

export const configEnv = process.env.NODE_ENV === 'production' ? prod : dev
