import { Subscription } from 'rxJs';
import * as jwt from 'jsonwebtoken';

// 입력 받는 Subscription을 구독해지 해요.
export function unSubscribe(subscription: Subscription) {
    if (subscription !== undefined && subscription !== null) {
        subscription.unsubscribe();
    }
}

export function jwtDecode(token: string): string | { [key: string]: any } {
    return jwt.decode(token);
}
