import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Body for POST /auth/refresh. The refresh token is validated
 * cryptographically by JwtRefreshStrategy (against JWT_REFRESH_SECRET);
 * this DTO just guarantees it's present so the global ValidationPipe
 * returns a clean 400 rather than the strategy failing opaquely.
 */
export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
