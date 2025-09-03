import { describe, it, expect, beforeEach, vi } from 'vitest';
import https from 'https';
import { Vemetric } from '../src/index';

// Mock the https module
vi.mock('https', () => {
  const mockRequest = vi.fn();
  return {
    default: {
      request: mockRequest,
    },
    request: mockRequest,
  };
});

describe('Vemetric', () => {
  let vemetric: Vemetric;
  const mockToken = 'test-token';
  const mockHost = 'https://test.vemetric.local';
  let mockWriteData: string;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockWriteData = '';

    // Setup mock implementation
    (https.request as ReturnType<typeof vi.fn>).mockImplementation((_url, _options, callback) => {
      // Create a mock request object with all necessary methods
      const mockRequest = {
        on: vi.fn(),
        write: vi.fn((data: string) => {
          mockWriteData = data;
          return true;
        }),
        end: vi.fn(),
      };

      // Simulate successful response
      const mockResponse = {
        statusCode: 200,
        statusMessage: 'OK',
      };
      callback(mockResponse);
      return mockRequest;
    });

    vemetric = new Vemetric({
      token: mockToken,
      host: mockHost,
    });
  });

  describe('trackEvent', () => {
    it('should send correct request with event data', async () => {
      const eventName = 'test_event';
      const userIdentifier = 'user123';
      const userDisplayName = 'John Doe';
      const eventData = { test: 'data' };
      const userData = {
        set: { name: 'Test User' },
        setOnce: { firstSeen: '2024-01-01' },
        unset: ['oldProperty'],
      };

      await vemetric.trackEvent(eventName, {
        userIdentifier,
        userDisplayName,
        eventData,
        userData,
      });

      // Verify https.request was called with correct arguments
      expect(https.request).toHaveBeenCalledWith(
        `${mockHost}/e`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Token: mockToken,
            'V-SDK': 'node',
            'V-SDK-Version': '%VEMETRIC_SDK_VERSION%',
          }),
        }),
        expect.any(Function),
      );

      // Verify payload structure
      const payload = JSON.parse(mockWriteData);
      expect(payload).toEqual({
        name: eventName,
        userIdentifier,
        displayName: userDisplayName,
        customData: eventData,
        userData,
      });
    });

    it('should handle request errors gracefully', async () => {
      // Mock request error
      (https.request as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const mockRequest = {
          on: vi.fn().mockImplementation((event: string, handler: (error: Error) => void) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
            return mockRequest;
          }),
          write: vi.fn((data: string) => {
            mockWriteData = data;
            return true;
          }),
          end: vi.fn(),
        };
        return mockRequest;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await vemetric.trackEvent('test_event', {
        userIdentifier: 'user123',
      });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Error tracking Vemetric event', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('updateUser', () => {
    it('should send correct request with user data', async () => {
      const userIdentifier = 'user123';
      const userData = {
        set: { name: 'Test User' },
        setOnce: { firstSeen: '2024-01-01' },
        unset: ['oldProperty'],
      };

      await vemetric.updateUser({
        userIdentifier,
        userData,
      });

      // Verify https.request was called with correct arguments
      expect(https.request).toHaveBeenCalledWith(
        `${mockHost}/u`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Token: mockToken,
            'V-SDK': 'node',
            'V-SDK-Version': '%VEMETRIC_SDK_VERSION%',
          }),
        }),
        expect.any(Function),
      );

      // Verify payload structure
      const payload = JSON.parse(mockWriteData);
      expect(payload).toEqual({
        userIdentifier,
        data: userData,
      });
    });
  });
});
