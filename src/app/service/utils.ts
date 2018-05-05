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

// 글 작성시간과 오늘 날짜를 비교해서, 같은 날짜면 시간만 출력,
// 다른 날짜면 날짜만 출력.
export function changeTimeString(time?: string, isFull?: boolean) {
    if (time !== undefined && isFull !== undefined) {
        // console.log(`CHANGE TIME STRING`);
        // console.log(`${time}, ${isFull}`);
        const today = new Date().toLocaleDateString();
        const date = new Date(time);

        if (today === date.toLocaleDateString()) {
            // 입력된 날짜가 오늘과 같다면..
            return isFull === true ?
                    date.toLocaleString()
                :
                    date.getHours() + ':' +
                    date.getMinutes() + ':' +
                    date.getSeconds();
        } else {
            // 입력된 날짜가 오늘과 다르다면..
            return isFull === true ?
                    date.toLocaleString()
                :
                    date.toLocaleDateString();
        }
    }
}
