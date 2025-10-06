export interface MockFetchResponse {
  ok: boolean;
  error(): string;
  json(): {
    success: boolean;
    payload?: any;
    error?: string;
  };
}

export interface PartialMockFetchResponse {
  error?: string;
  json?: {
    success: boolean;
    payload?: any;
    error?: string;
  };
}

export const createMockApiResponse = (partial: PartialMockFetchResponse) => {
  const { error, json } = partial;
  const mockResponse: MockFetchResponse = {
    ok: !error,
    error: () => {
      return error ?? '';
    },
    json: () => {
      return json ?? {success: false, error: 'Bad Request'};
    },
  };
  return mockResponse;
};
