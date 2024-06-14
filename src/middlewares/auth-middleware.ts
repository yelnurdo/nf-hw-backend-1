import { NextFunction, Request, Response } from 'express';
import AuthService from '../auth/auth-service';
import UserModel from '../auth/models/User'; 

const authService = new AuthService();

export const authMiddleware = async (token: string) => {
  const payload = authService.verifyJwt(token);
  if (!payload) {
    return null;
  }

  const user = await UserModel.findById(payload.id);
  if (!user) {
    return null;
  }

  return user;
};
