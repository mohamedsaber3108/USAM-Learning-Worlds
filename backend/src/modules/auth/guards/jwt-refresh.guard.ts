import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for the dedicated refresh-token strategy (audit T-P1-1).
 * Use on POST /auth/refresh so the refresh token in the request body is
 * validated against JWT_REFRESH_SECRET — NOT the access-token guard.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
