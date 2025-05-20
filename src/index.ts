import https from 'https';

export type Options = {
  token: string;
  host?: string;
};

const DEFAULT_OPTIONS: Options = {
  token: '',
  host: 'https://hub.vemetric.com',
};

function getBasicRequestHeaders(token: string) {
  return {
    Token: token,
    'V-SDK': 'node',
    'V-SDK-Version': '%VEMETRIC_SDK_VERSION%',
  };
}

type UserDataProps = {
  set?: object;
  setOnce?: object;
  unset?: Array<string>;
};

type EventProps = {
  userIdentifier: string;
  eventData?: Record<string, unknown>;
  userData?: UserDataProps;
};

type UserUpdateProps = {
  userIdentifier: string;
  userData: UserDataProps;
};

export class Vemetric {
  private options: Options = DEFAULT_OPTIONS;

  constructor(options: Options) {
    if (!options.token || options.token.length < 3) {
      throw new Error('Please provide your Public Token.');
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private async sendRequest(
    path: string,
    payload?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
  ) {
    return new Promise((resolve, reject) => {
      const data = payload ? JSON.stringify(payload) : undefined;

      const req = https.request(
        `${this.options.host}${path}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data ? Buffer.byteLength(data) : undefined,
            ...headers,
          },
        },
        (res) => {
          if (typeof res.statusCode === 'number' && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res);
          } else {
            reject({
              status: res.statusCode,
              statusText: res.statusMessage,
            });
          }
        },
      );

      req.on('error', (e) => {
        console.error('Error sending request', e);
        reject({
          statusText: 'Unknown error',
        });
      });

      req.write(data);
      req.end();
    });
  }

  async trackEvent(eventName: string, { eventData, userIdentifier, userData }: EventProps) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        name: eventName,
        userIdentifier,
      };
      if (eventData) {
        payload.customData = eventData;
      }
      if (userData) {
        payload.userData = userData;
      }

      const headers = getBasicRequestHeaders(this.options.token);
      await this.sendRequest('/e', payload, headers);
    } catch (error) {
      console.error('Error tracking Vemetric event', error);
    }
  }

  async updateUser({ userIdentifier, userData }: UserUpdateProps) {
    try {
      const payload = {
        userIdentifier,
        ...userData,
      };

      const headers = getBasicRequestHeaders(this.options.token);
      await this.sendRequest('/u', payload, headers);
    } catch (error) {
      console.error('Error updating Vemetric user', error);
    }
  }
}
