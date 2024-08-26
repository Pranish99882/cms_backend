import { Request, Response, NextFunction } from 'express';
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

const mongoUri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const mongoDbName = 'yourMongoDb'; // Replace with your MongoDB database name

// Create a Redis client
const redisClient = createClient({
    url: 'redis://localhost:6379',
});

redisClient.connect().catch(console.error); // Handle connection errors

export const restriction = (requiredPermission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const roleNames = req.reqData?.roleNames;

        if (!roleNames) {
            return res
                .status(403)
                .json({ message: 'Forbidden: User role not found' });
        }

        try {
            // Check Redis cache first
            const cachedPermissions = await redisClient.get(roleNames);

            if (cachedPermissions) {
                const userPermissions: string[] = JSON.parse(cachedPermissions);

                // Check if the user has the required permission
                if (userPermissions.includes(requiredPermission)) {
                    return next();
                } else {
                    return res.status(403).json({
                        message: 'Forbidden: You do not have permission',
                    });
                }
            }

            // If not in Redis, fetch from MongoDB
            const client = new MongoClient(mongoUri);
            await client.connect();
            const database = client.db(mongoDbName);
            const rolesCollection = database.collection('roles');

            // Fetch the role from MongoDB
            const role = await rolesCollection.findOne({ roleName: roleNames });

            if (!role) {
                return res
                    .status(403)
                    .json({ message: 'Forbidden: Role not found' });
            }

            const userPermissions: string[] = role.permissionNames;

            // Cache the permissions in Redis with an expiration time (e.g., 1 hour)
            await redisClient.setEx(
                roleNames,
                60,
                JSON.stringify(userPermissions)
            );

            // Check if the user has the required permission
            if (userPermissions.includes(requiredPermission)) {
                next();
            } else {
                res.status(403).json({
                    message: 'Forbidden: You do not have permission',
                });
            }
        } catch (error) {
            console.error(
                'Error fetching permissions from MongoDB or Redis:',
                error
            );
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
