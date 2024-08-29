import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import 'dotenv/config';
import { indexUsersToElasticsearch } from './controllers/indexUser';
import { AppDataSource } from './db/datasource';
import routes from './routes/userRoutes';
import {
    listenForMessages,
    getUsersFromDB,
} from './controllers/userController';
import { connectRabbitMQ } from './config/rabbitmqconfig';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: 'http://localhost:3001', // Frontend's URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    })
);

app.use('/', routes);

const startServer = async () => {
    try {
        connectRabbitMQ().then(() => listenForMessages());

        await AppDataSource.initialize();
        console.log('MySQL Database connected successfully');

        const users = await getUsersFromDB();
        await indexUsersToElasticsearch(users);
        console.log('Users indexed to Elasticsearch');

        const port = 3000;
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (error) {
        console.error(
            'Error initializing databases or starting server:',
            error
        );
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}
