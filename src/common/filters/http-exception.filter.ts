import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express'; // Express Response 타입 명시적으로 import

@Catch(HttpException)
// HttpException이 발생했을 때만 실행되는 예외 필터 클래스
export class HttpExceptionFilter implements ExceptionFilter {
  // 모든 예외를 가로채 처리할 메서드
  catch(exception: HttpException, host: ArgumentsHost) {
    // HTTP 요청 context로 전환 (RPC, WebSocket과 구분)
    const ctx = host.switchToHttp();

    // Express의 Response 객체를 가져옴
    const response = ctx.getResponse<Response>(); // 여기서 Response 타입 명시

    // 에러 상태 코드 추출 (예: 400, 401, 403 등)
    const status = exception.getStatus();

    // 예외 응답 메시지 추출 (string 또는 object일 수 있음)
    const message = exception.getResponse();

    // JSON 형태로 커스텀 에러 응답 반환
    response.status(status).json({
      statusCode: status, // HTTP 상태 코드
      message, // 에러 메시지 또는 객체
      timestamp: new Date().toISOString(), // 요청 시각
    });
  }
}
