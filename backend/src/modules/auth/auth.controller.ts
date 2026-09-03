import { Controller, Post, Patch, Body, UseGuards, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateAgeBandDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 20, ttl: 900000 } }) // 20 registrations / 15 min / IP — raised from 5:
  // this is a family platform where multiple kids/guardians on the same
  // home network share one public IP (NAT), so 5 was too easy for normal
  // sibling sign-ups to trip. Still blocks real brute-force/spam patterns.
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 900000 } }) // 20 attempts / 15 min / IP — same
  // shared-household-IP reasoning as register above.
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      learner: user.learner,
      guardian: user.guardian,
    };
  }

  // Minimal endpoint to persist the age-band chosen during first-time
  // onboarding (Welcome -> Age Select -> Character Intro -> Complete).
  // Lives here (not a dedicated learners module) since none exists yet.
  @Patch('me/age-band')
  @UseGuards(JwtAuthGuard)
  async updateAgeBand(@CurrentUser() user: any, @Body() dto: UpdateAgeBandDto) {
    return this.authService.updateLearnerAgeBand(user.id, dto.ageBand);
  }
}
