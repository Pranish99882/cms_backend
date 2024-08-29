// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import bcrypt from 'bcryptjs';

// @Entity('users')
// export class User {
//     @PrimaryGeneratedColumn()
//     id: number;

//     @Column()
//     username: string;

//     @Column()
//     email: string;

//     @Column({ nullable: true })
//     password: string;

//     @Column({ type: 'varchar', length: 255, nullable: true })
//     passwordResetToken: string | null;

//     @Column({ type: 'timestamp', nullable: true, default: null })
//     passwordResetExpires: Date | null;

//     @Column({ default: true })
//     passwordSet: boolean;

//     @Column({ default: true })
//     isActive: boolean;

//     @Column()
//     roleNames: string;

//     @Column('simple-array')
//     permissionNames: string[];

//     async setPassword(password: string) {
//         this.password = await bcrypt.hash(password, 12);
//         this.passwordSet = true;
//     }
// }

// import {
//     Entity,
//     PrimaryGeneratedColumn,
//     Column,
//     BeforeInsert,
//     BeforeUpdate,
// } from 'typeorm';
// import bcrypt from 'bcryptjs';
// import { MongoClient } from 'mongodb';

// import { IRole } from '../models/role.model'; // Adjust the path as necessary

// @Entity('users')
// export class User {
//     @PrimaryGeneratedColumn()
//     id: number;

//     @Column()
//     username: string;

//     @Column()
//     email: string;

//     @Column({ nullable: true })
//     password: string;

//     @Column({ type: 'varchar', length: 255, nullable: true })
//     passwordResetToken: string | null;

//     @Column({ type: 'timestamp', nullable: true, default: null })
//     passwordResetExpires: Date | null;

//     @Column({ default: true })
//     passwordSet: boolean;

//     @Column({ default: true })
//     isActive: boolean;

//     @Column()
//     roleNames: string;

//     @Column('simple-array')
//     permissionNames: string[];

//     private static mongoUri = 'mongodb://localhost:27017';
//     private static mongoDbName = 'yourMongoDbName';

//     private static defaultPermissions: Record<string, string[]> = {
//         Admin: ['create', 'read', 'update', 'delete'],
//         User: ['read'],
//     };

//     async fetchPermissionsFromMongoDB() {
//         const client = new MongoClient(User.mongoUri);

//         try {
//             await client.connect();
//             const database = client.db(User.mongoDbName);
//             const rolesCollection = database.collection('roles'); // No need to specify type here

//             // Fetch permissions based on roleNames
//             let role = await rolesCollection.findOne({
//                 roleName: this.roleNames,
//             });

//             if (!role) {
//                 // Role does not exist, create it with default permissions
//                 const defaultPermissions =
//                     User.defaultPermissions[this.roleNames] || [];
//                 const result = await rolesCollection.insertOne({
//                     roleName: this.roleNames,
//                     permissionNames: defaultPermissions,
//                 });

//                 // Construct the role object with the result insertedId
//                 role = {
//                     _id: result.insertedId, // MongoDB provides the _id
//                     roleName: this.roleNames,
//                     permissionNames: defaultPermissions,
//                 } as IRole; // Type cast to match IRole
//             } else {
//                 // If role is found, use it
//                 role = role as IRole;
//             }

//             this.permissionNames = role ? role.permissionNames : [];
//         } finally {
//             await client.close();
//         }
//     }

//     async setPassword(password: string) {
//         this.password = await bcrypt.hash(password, 12);
//         this.passwordSet = true;
//     }

//     @BeforeInsert()
//     @BeforeUpdate()
//     async setPermissions() {
//         await this.fetchPermissionsFromMongoDB();
//     }
// }
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

import { IRole } from '../models/role.model'; // Adjust the path as necessary
import { config } from '../config/config';
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    passwordResetToken: string | null;

    @Column({ type: 'timestamp', nullable: true, default: null })
    passwordResetExpires: Date | null;

    @Column({ default: true })
    passwordSet: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    roleNames: string;

    // Do not include `permissionNames` column here
    // Update your configuration to use environment variables

    private static mongoUri = config.mongo.uri || 'mongodb://localhost:27017';
    private static mongoDbName = config.mongo.dbName || 'yourMongoDb';

    private static defaultPermissions: Record<string, string[]> = {
        Admin: ['create', 'read', 'update', 'delete'],
        User: ['read'],
    };

    async fetchPermissionsFromMongoDB(): Promise<string[]> {
        const client = new MongoClient(User.mongoUri);

        try {
            await client.connect();
            const database = client.db(User.mongoDbName);
            const rolesCollection = database.collection('roles');

            // Fetch permissions based on roleNames
            let role = await rolesCollection.findOne({
                roleName: this.roleNames,
            });

            if (!role) {
                // Role does not exist, create it with default permissions
                const defaultPermissions =
                    User.defaultPermissions[this.roleNames] || [];
                const result = await rolesCollection.insertOne({
                    roleName: this.roleNames,
                    permissionNames: defaultPermissions,
                });

                // Construct the role object with the result insertedId
                role = {
                    _id: result.insertedId,
                    roleName: this.roleNames,
                    permissionNames: defaultPermissions,
                } as IRole;
            } else {
                role = role as IRole;
            }

            return role ? role.permissionNames : [];
        } finally {
            await client.close();
        }
    }

    async setPassword(password: string) {
        this.password = await bcrypt.hash(password, 12);
        this.passwordSet = true;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async setPermissions() {
        // No need to fetch permissions here
    }
}
