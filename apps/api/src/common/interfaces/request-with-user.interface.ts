import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string | null;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
