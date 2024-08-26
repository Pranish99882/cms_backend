import { Schema, Document, model } from 'mongoose';
import { ObjectId } from 'mongodb';

// Define the TypeScript interface for the Role document
export interface IRole extends Document {
    _id: ObjectId; // Ensure _id is included and typed
    roleName: string;
    permissionNames: string[];
}

// Define the schema for the Role model
const RoleSchema: Schema = new Schema({
    roleName: { type: String, required: true, unique: true },
    permissionNames: { type: [String], required: true },
});

// Create the Role model with Mongoose
export const Role = model<IRole>('Role', RoleSchema);
