import express from 'express';

import { authentication } from '../middlewares/authentication';
import { restriction } from '../middlewares/restriction';
import { userController } from '../controllers/userController';
import {
    userInjection,
    secureuserInjection,
    publishMsg,
    listenForMessages,
} from '../controllers/userController';

const router = express.Router();

router.post('/loginData', userController.loginData);
router.post('/logout', userController.logout);
router.post('/register', userController.register);
router.post('/createUser', userController.createUser);
router.get(
    '/getAllUsers',
    authentication,
    restriction('read'),
    userController.getAllUsers
);
router.delete(
    '/userDelete/:id',
    authentication,
    restriction('delete'),
    userController.delete
);
router.get('/profile', authentication, userController.getProfile);
router.put('/profile', authentication, userController.updateProfile);
router.post('/setPassword', userController.setPassword);
router.get('/searchUser', userController.searchUsers);
router.get('/search/users/:email', userInjection);
router.get('/secure/users/:email', secureuserInjection);
router.get('/check', (req, res) => {
    res.send('you are ready to go !!!');
});
router.post('/publish', publishMsg);

listenForMessages();

export default router;
