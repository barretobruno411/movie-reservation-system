import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Erro interno no servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof QueryFailedError) {
      // 🎯 Aqui você trata os erros de banco
      const driverError: any = exception.driverError;

      if (driverError.code === '23505') {
        // violação de unique constraint
        status = HttpStatus.CONFLICT;
        message = 'Já existe um registro com este valor (duplicado)';
      } else if (driverError.code === '23503') {
        // violação de foreign key
        status = HttpStatus.BAD_REQUEST;
        message = 'Violação de chave estrangeira';
      } else {
        message = driverError.detail || exception.message;
      }
    } else if (exception instanceof Error) {
      // fallback para erros comuns de JS/TS
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
