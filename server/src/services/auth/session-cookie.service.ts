import { sign, verify } from 'jsonwebtoken';
import { RequestContext } from '../request-context';

export class SessionCookieService {
    constructor(
      private readonly sessionSecret: string,
      private readonly request: RequestContext) {}

  createSessionToken(payload: object) {
    return sign(payload, this.sessionSecret, { expiresIn: '1h' });
  }

  verifySessionToken(): boolean {
    const sessionCookie = this.request.sessionCookie;
    if (!sessionCookie) {
      return false;
    }
    try {
      return verify(sessionCookie, this.sessionSecret) as any;
    } catch (err) {
      return false;
    }
  }
}
