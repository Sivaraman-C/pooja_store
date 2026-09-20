import { resolveApiUrl } from './apiConfig';

describe('resolveApiUrl', () => {
  test('uses local backend on localhost', () => {
    expect(resolveApiUrl('localhost')).toBe('http://localhost:5000');
  });

  test('uses cloud backend on mobile/web hostnames', () => {
    expect(resolveApiUrl('192.168.1.22')).toBe('https://devaloka-api.onrender.com');
    expect(resolveApiUrl('com.devaloka.app')).toBe('https://devaloka-api.onrender.com');
  });
});
