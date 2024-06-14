import { NextFunction, Request, Response } from 'express';
import AuthService from '../auth/auth-service';
import UserModel from '../auth/models/User'; 

const authService = new AuthService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyJwt(token);

  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const user = await UserModel.findById(payload.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  (req as any).user = user;
  next();
};
