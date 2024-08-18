import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { userController } from './controllers/userController';
import { authentication } from './middlewares/authentication';
import { restriction } from './middlewares/restriction';

export const app=express();

app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: 'http://localhost:3001',   //frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
}));


  app.post('/register',userController.register);
  app.post('/createUser',userController.createUser);
  app.get('/getAllUsers',authentication, userController.getAllUsers);
  app.delete('/userDelete/:id',authentication,restriction('delete'),userController.delete);
  app.post('/loginData',userController.loginData);
  app.get('/profile', authentication, userController.getProfile);
  app.put('/profile', authentication, userController.updateProfile);
  app.post('/setPassword',userController.setPassword);
  
  if (require.main === module) {
    const port = 3000;
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  }