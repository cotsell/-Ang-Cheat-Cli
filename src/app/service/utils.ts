import { Subscription } from 'rxJs';

// 입력 받는 Subscription을 구독해지 해요.
export function unSubscribe(subscription: Subscription) {
    if (subscription !== undefined && subscription !== null) {
        subscription.unsubscribe();
    }
}

