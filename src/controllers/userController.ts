import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { MoreThan } from 'typeorm';

import { User } from '../entities/User';
import { AppDataSource } from '../db/datasource';
import { client } from '../elasticsearchclient';
import { getChannel } from '../config/rabbitmqconfig';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pranish2002bhagat@gmail.com',
        pass: 'lvbn zths iwlp lmyw',
    },
});

export const userController = {
    register: async (req: Request, res: Response) => {
        try {
            const { username, email, password, roleNames } = req.body;
            const userRepository = AppDataSource.getRepository(User);

            // Check if the user already exists
            const existingUser = await userRepository.findOne({
                where: { email },
            });
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: 'Email already in use' });
            }

            // Create a new user instance
            const newUser = new User();
            newUser.username = username;
            newUser.email = email;
            newUser.roleNames = roleNames || 'User';

            // Set the password
            await newUser.setPassword(password);

            // Save the user to MySQL
            await userRepository.save(newUser);

            // Fetch and set permissions from MongoDB
            const permissionNames = await newUser.fetchPermissionsFromMongoDB();

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    ...newUser,
                    permissionNames,
                },
            });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    createUser: async (req: Request, res: Response) => {
        const { username, email, roleNames } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);

            const existingUser = await userRepository.findOne({
                where: { email },
            });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const token = uuidv4();

            const newUser = await userRepository.create({
                username,
                email,
                roleNames,
                passwordSet: false,
                passwordResetToken: token,
                passwordResetExpires: new Date(Date.now() + 180000),
                isActive: false,
            });
            const permissionNames = await newUser.fetchPermissionsFromMongoDB();

            await userRepository.save(newUser);
            console.log(newUser);

            const resetUrl = `http://localhost:3001/setPassword?token=${token}`;

            const mailOptions = {
                from: '"Pranish" <pranish2002bhagat@gmail.com>',
                to: email,
                subject: 'Set Your Password',
                html: `<p>Hello ${username},</p>
               <p>Please click the following link to set your password: <a href="${resetUrl}">Set Password</a></p>`,
            };

            await transporter.sendMail(mailOptions);
            res.status(201).json({
                message: 'User created. Check your email to set a password.',
                user: newUser,
                permissionNames,
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    },

    setPassword: async (req: Request, res: Response) => {
        const { token, password } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: MoreThan(new Date()), // Check if token is not expired
                },
            });

            if (!user || user.passwordSet) {
                const alreadyPwUrl = `http://localhost:3001/alreadyPW`;
                return res.status(200).json({
                    message:
                        'Password has already been set or token is invalid. Redirecting...',
                    redirectUrl: alreadyPwUrl,
                });
            }

            await user.setPassword(password);
            user.isActive = true;
            await userRepository.save(user);

            const loginUrl = `http://localhost:3001/loginData`;
            return res.status(200).json({
                message:
                    'Password has been set successfully. Redirecting to login...',
                redirectUrl: loginUrl,
            });
        } catch (error) {
            console.error('Error setting password:', error);
            return res.status(500).json({ message: 'Error setting password' });
        }
    },

    loginData: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ message: 'User not registered' });
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );
            if (!isPasswordValid) {
                return res.status(401).json({ message: ' Wrong password' });
            }

            const token = jwt.sign({ id: user.id }, 'MONOTYPE', {
                expiresIn: '1h',
            });

            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600000,
            });

            return res.status(200).json({
                message: 'Login successful',
                token,
            });
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    getAllUsers: async (req: Request, res: Response) => {
        try {
            const userRepository = AppDataSource.getRepository(User);

            // Get page and limit from query params (default to page 1 and limit 10)
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Calculate the offset
            const offset = (page - 1) * limit;

            // Fetch users with pagination
            const [users, total] = await userRepository.findAndCount({
                select: ['id', 'username', 'email', 'isActive', 'roleNames'],
                skip: offset, // Skip the first "offset" users
                take: limit, // Limit the number of users fetched to "limit"
            });

            // Calculate total pages
            const totalPages = Math.ceil(total / limit);

            // Send response with users, current page, total pages, and total users
            res.status(200).json({
                users,
                currentPage: page,
                totalPages,
                totalUsers: total,
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getProfile: async (req: Request, res: Response) => {
        try {
            const userRepository = AppDataSource.getRepository(User);

            const userEmail = req.reqData?.email;
            if (!userEmail) {
                return res
                    .status(401)
                    .json({ message: 'Unauthorized: No user logged in' });
            }

            const user = await userRepository.findOne({
                where: { email: userEmail },
                select: ['username', 'email', 'roleNames'],
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateProfile: async (req: Request, res: Response) => {
        const { username, email, roleNames } = req.body;
        const userId = req.reqData?.id; // As middleware has attached the authenticated user to the request
        console.log(userId, username);

        try {
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({
                where: { id: userId },
                select: ['id', 'username', 'email', 'roleNames'],
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (username) user.username = username;
            if (email) user.email = email;
            if (roleNames) user.roleNames = roleNames;

            await userRepository.save(user);

            res.status(200).json({
                message: 'Profile updated successfully',
                username: user.username,
                email: user.email,
                roleNames: user.roleNames,
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const userId = parseInt(req.params.id);

            const user = await userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({ message: 'Student not found' });
            }

            await userRepository.remove(user);
            res.json({ message: 'Student deleted' });
        } catch (error) {
            console.error('Error deleting student:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    logout: async (req: Request, res: Response) => {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.json({ message: 'Logout Successful' });
    },

    searchUsers: async (req: Request, res: Response) => {
        const query = req.query.q as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        try {
            const result = await client.search({
                index: 'users',
                body: {
                    query: {
                        multi_match: {
                            query,
                            fields: ['username', 'email', 'roleNames'],
                        },
                    },

                    size: limit,
                },
            });

            const totalUsers = (result.hits.total as { value: number }).value;

            const totalPages = Math.ceil(totalUsers / limit);

            res.status(200).json({
                users: result.hits.hits, // Respond with the found users
                currentPage: page,
                totalPages: totalPages,
            });
        } catch (error) {
            console.error('Error searching users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};

export const getUsersFromDB = async () => {
    const userRepository = AppDataSource.getRepository(User);

    // Retrieve users from the database, selecting only specific columns
    const users = await userRepository.find({
        select: ['id', 'username', 'email', 'isActive', 'roleNames'],
    });

    return users;
};

export const userInjection = async (req: Request, res: Response) => {
    const { email } = req.params;

    const userRepository = AppDataSource.getRepository(User);

    try {
        // Vulnerable query that directly includes user input
        const query = `SELECT * FROM users WHERE email = '${email}'`;
        const user = await userRepository.query(query);

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const secureuserInjection = async (req: Request, res: Response) => {
    const { email } = req.params;

    const userRepository = AppDataSource.getRepository(User);

    try {
        // Secure parameterized query
        const query = `SELECT * FROM users WHERE email = ?`;
        const user = await userRepository.query(query, [email]);

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const QUEUE = 'myQueue';

export const publishMsg = async (req: Request, res: Response) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const channel = getChannel();
        channel.sendToQueue(QUEUE, Buffer.from(message));
        console.log(`Message sent: ${message}`);
        res.status(200).json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

export const listenForMessages = async () => {
    try {
        const channel = getChannel();

        await channel.assertQueue(QUEUE, { durable: false });

        channel.consume(
            QUEUE,
            (message) => {
                if (message) {
                    console.log(
                        `Received message: ${message.content.toString()}`
                    );
                    channel.ack(message); // Acknowledge message after processing
                }
            },
            {
                noAck: false, // Set noAck to false to manually acknowledge messages
            }
        );

        console.log('Listening for messages...');
    } catch (error) {
        console.error('Error in message listener:', error);
    }
};
