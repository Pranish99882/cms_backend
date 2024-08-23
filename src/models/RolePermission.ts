import { Schema, model } from 'mongoose';

const rolePermissionSchema = new Schema({
    userId: { type: String, required: true },
    roleNames: { type: String, required: true },
    permissionNames: [{ type: [String], required: true }],
});

export const RolePermission = model('RolePermission', rolePermissionSchema);
