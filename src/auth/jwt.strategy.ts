import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization: Bearer xxx
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret, // 환경변수로 관리 권장
    });
  }

  async validate(payload: any) {
    // 요청 객체에 user 추가됨
    return { userId: payload.sub, email: payload.email };
  }
}
