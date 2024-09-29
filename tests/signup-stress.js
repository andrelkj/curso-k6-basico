import http from 'k6/http';
import { sleep, check } from 'k6';

import uuid from './libs/uuid.js';

// stress test uses stages with increasing amount of data to validate the system performance on extreme loads of trafic
export const options = {
  stages: [
    {duration: '2m', target: 100}, // below normal load
    {duration: '5m', target: 100},
    {duration: '2m', target: 200}, // normal load
    {duration: '5m', target: 200},
    {duration: '2m', target: 300}, // around the breaking point
    {duration: '5m', target: 300},
    {duration: '2m', target: 400}, // beyond the breaking point
    {duration: '5m', target: 400},
    {duration: '10m', target: 0}, // scale down. Recovery stage
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests are expected to run in less than 2 seconds
    http_req_failed: ['rate<0.01'] // 1% of requests send can fail
  },
};

export default function () {
  const url = 'http://localhost:3333/signup';

  const payload = JSON.stringify({
    email: `${uuid.v4().substring(24)}@test.performance.com`,
    password: 'pwd123',
  });

  const headers = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, headers);

  check(res, {
    'status should be 201': (r) => r.status === 201,
  });

  sleep(1);
}
