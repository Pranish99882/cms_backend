import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { AppDataSource } from './db/datasource';
import { connectMongoDB } from './db/mongoDBconnection';
import { userController } from '../src/controllers/userController';
import { authentication } from './middlewares/authentication';
import { restriction } from './middlewares/restriction';
import { indexUsersToElasticsearch } from './controllers/indexUser';
import { getUsersFromDB } from './controllers/userController';

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

app.post('/loginData', userController.loginData);
app.post('/logout', userController.logout);
app.post('/register', userController.register);
app.post('/createUser', userController.createUser);
app.get('/getAllUsers', userController.getAllUsers);
app.delete(
    '/userDelete/:id',
    authentication,
    restriction('delete'),
    userController.delete
);
app.get('/profile', authentication, userController.getProfile);
app.put('/profile', authentication, userController.updateProfile);
app.post('/setPassword', userController.setPassword);
app.get('/searchUser', userController.searchUsers);

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('MySQL Database connected successfully');
        const users = await getUsersFromDB();
        await indexUsersToElasticsearch(users);
        console.log('Users indexed to Elasticsearch');

        await connectMongoDB();

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
