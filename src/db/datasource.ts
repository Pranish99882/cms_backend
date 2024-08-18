import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'kiit@123',
  database: 'cms',
  synchronize: true,
  logging: false,
  entities: ['src/entities/*.ts'],
  migrations:['src/migrations/*.ts'],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => console.log('Error connecting database', err));
