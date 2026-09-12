import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Dedicated refresh-token strategy (audit T-P1-1 / GAP-S6 / API-3).
 *
 * Previously `/auth/refresh` was guarded by the ACCESS-token strategy, which
 * meant a client could only refresh while it still held a VALID access token —
 * defeating the entire purpose of refresh, and it never validated the refresh
 * token against JWT_REFRESH_SECRET at all.
 *
 * This strategy reads the refresh token from the request body (`refreshToken`),
 * verifies it against JWT_REFRESH_SECRET (so an access token cannot be used
 * here, and an expired access token does not block a refresh), confirms the
 * user is still active, and attaches the validated user + the raw token to
 * `req.user` so the service can rotate it.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ||
        // Safe fallback only for misconfigured dev; production sets the real secret.
        'dev_refresh_secret_change_me',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = (req.body as any)?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      refreshToken,
    };
  }
}
