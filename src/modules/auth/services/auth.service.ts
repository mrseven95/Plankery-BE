import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/services/user.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { IUserWithoutPassword } from '../../user/interfaces/user.interface';
import { getUserId } from '../../../common/helper/utils';

export interface JwtPayload {
  email: string;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.userService.create(registerDto);
    const userId = getUserId(user);
    const payload: JwtPayload = { email: user.email, sub: userId };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = user._id?.toString() || user.id || '';
    const payload: JwtPayload = { email: user.email, sub: userId };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<IUserWithoutPassword | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.userService.validatePassword(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const userObj = user.toObject();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
      const { password, ...result } = userObj;
      return result as IUserWithoutPassword;
    }
    return null;
  }
}
