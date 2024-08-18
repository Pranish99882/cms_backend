import { Request, Response, NextFunction } from 'express';
import { permissionArray } from '../types/permissionArray';

export const restriction = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions: string[] =  permissionArray 

    if (userPermissions.includes(requiredPermission)) {
      next(); 
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have permission' });
    }
  };
};
