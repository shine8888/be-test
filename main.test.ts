import { findServer } from './main';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import 'jest';

jest.setTimeout(30000);

// Enable fetch mocking
enableFetchMocks();

describe('findServer()', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('should reject with an error if no servers are online', async () => {
    fetchMock.mockResponse('', { status: 503 }); // Offline server
    fetchMock.mockResponse('', { status: 404 }); // Offline server
    fetchMock.mockResponse('', { status: 500 }); // Offline server
    fetchMock.mockResponse('', { status: 502 }); // Offline server

    await expect(findServer()).rejects.toThrow('No servers are online.');
  });

  test('should resolve with the online server with lowest priority', async () => {
    fetchMock.mockResponseOnce('', { status: 503 }); // Offline server
    fetchMock.mockResponseOnce('', { status: 200 }); // Online server with lowest priority
    fetchMock.mockResponseOnce('', { status: 404 }); // Offline server
    fetchMock.mockResponseOnce('', { status: 200 }); // Online server with higher priority
    const server = await findServer();

    expect(server.url).toBe('https://offline.scentronix.com');
  });
});
