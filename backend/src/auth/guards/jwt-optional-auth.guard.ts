import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to allow the request to proceed even if authentication fails
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, return undefined instead of throwing
    // This allows the endpoint to work without authentication
    if (err || !user) {
      return undefined;
    }
    return user;
  }

  // Override canActivate to always return true (allow the request)
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Always allow the request, but try to authenticate if a token is provided
    return super.canActivate(context) as Promise<boolean>;
  }
}
