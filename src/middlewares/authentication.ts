import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../db/datasource';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { permissionArray } from '../types/permissionArray';


export const authentication = async (req: Request, res: Response, next: NextFunction) => {

  const token = req.cookies.authToken;
  console.log('Token:', token); 
  permissionArray.length = 0;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, 'MONOTYPE') as JwtPayload;
    console.log('Decoded Token:', decoded); 

    const userRepository = AppDataSource.getRepository(User);
    const user= await userRepository.findOne({ 
      where: { id:decoded.id }, 
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized !!!! ' });
    }
     
    //Add later  Attach the authenticated student to the request object
    console.log("userData",user);
    req.reqData=user;
    
    permissionArray.push(...user.permissionNames);
    console.log("Permission list",permissionArray)
    next();

  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
