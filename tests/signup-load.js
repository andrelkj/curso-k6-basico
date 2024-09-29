import http from 'k6/http';
import { sleep, check } from 'k6';

import uuid from './libs/uuid.js';

// load test uses the stages to add, mantain and decrease the load amount on a period of time to validade system behavior against regular and peak trafic
export const options = {
  stages: [
    {duration: '1m', target: 100},
    {duration: '2m', target: 100},
    {duration: '1m', target: 0},
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
