import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestContextInterceptor } from './interceptor/request-context.interceptor';
import { RequestContextService } from './interceptor/request-context.service';
import { RolesGuard } from './auth/guards/roles.guard';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [
    // 요청별 컨텍스트를 저장하고 관리하기 위한 서비스
    // AsyncLocalStorage를 내부적으로 활용하여 요청 간 데이터 격리 보장
    RequestContextService,
    // NestJS 전역 인터셉터 등록
    // 모든 요청에 대해 RequestContextInterceptor가 자동 적용됨
    {
      provide: APP_INTERCEPTOR, // 전역 인터셉터 토큰 (NestJS 시스템 예약 키)
      useClass: RequestContextInterceptor, // 전역 인터셉터 토큰 (NestJS 시스템 예약 키)
    },
    // 전역 가드: 권한 확인 (예: @Roles 데코레이터 기반)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // 요청 속도 제한
    },
    // 전역 예외 필터: 예외 응답 구조 통일 및 로깅 처리
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 전역 파이프: DTO 유효성 검사 및 타입 자동 변환
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppService,
  ],
})
export class AppModule {}
