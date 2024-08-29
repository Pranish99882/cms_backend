import { DataSource } from 'typeorm';
import 'reflect-metadata';

const port = parseInt(process.env.MYSQL_PORT ?? '3306', 10);

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: port,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    synchronize: false, // Set to true in development, false in production
    logging: false, // Set to true if you want to log SQL queries
    entities: ['src/entities/*.ts'],
    migrations: ['src/migrations/*.ts'],
    subscribers: [],
});
