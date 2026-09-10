import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
    ],
};

export default function () {
    const response = http.get('http://YOUR-CAPSULE-URL/api/events');

    check(response, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}