import '@testing-library/jest-dom';
import { Fail, logoutRequestBody, logoutResponseBody, Success } from 'c-lib';
import { createMockApiResponse } from '@/test/responses';
import FetchAPI from '../api';

const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

global.fetch = mockFetch;

const badToken = 'badToken';
const someToken = '1111222233334444'
const newToken = '1234123412341234';
const successResponse = createMockApiResponse({json: {success: true, payload: true}});
const failResponse = createMockApiResponse({json: {success: false, error: 'Something bad happened'}});
const badResponse = createMockApiResponse({error: 'Bad Request'});
const path = '/';

describe('FetchAPI', () => {
  let fetchAPI: FetchAPI;
  beforeEach(() => {
    fetchAPI = new FetchAPI();
  });

//   test('getToken and setToken work', () => {
//     expect(fetchAPI.getToken()).toBeNull();
    
//     fetchAPI.setToken(someToken);
//     expect(fetchAPI.getToken()).toBe(someToken);
//   });

//   test('unable to set token without setToken', () => {
//     let token = fetchAPI.getToken();
      
//     token = badToken;
//     expect(fetchAPI.getToken()).not.toEqual(token);

//     token = null;
//     fetchAPI.setToken(newToken);

//     expect(token).toBeNull();
//     expect(fetchAPI.getToken()).toBe(newToken);

//     token = someToken;
//     fetchAPI.setToken(null);

//     expect(token).toBe(someToken)
//     expect(fetchAPI.getToken()).toBeNull();
//   });

//   test('clearToken removes the token', () => {
//     fetchAPI.setToken(newToken);
//     expect(fetchAPI.getToken()).toBe(newToken);

//     fetchAPI.clearToken();
//     expect(fetchAPI.getToken()).toBeNull();
//   });


  it('returns a Success on an ok request', async () => {
    mockFetch.mockReturnValue(successResponse);
    expect(successResponse.ok).toBeTruthy();
    expect(successResponse.json().success).toBeTruthy();

    const res = ( await fetchAPI.request<logoutResponseBody, {}>(path, {})) as Success<boolean>;
    expect(res.success).toBeTruthy();
    expect(res.payload).toBe(successResponse.json().payload);
  });

  it('returns a Fail on an ok request', async () => {
    mockFetch.mockReturnValue(failResponse);
    expect(failResponse.ok).toBeTruthy();
    expect(failResponse.json().success).toBeFalsy();

    const res = ( await fetchAPI.request<logoutResponseBody, {}>(path, {})) as Fail;
    expect(res.success).toBe(failResponse.json().success);
    expect(res.error).toBe(failResponse.json().error);
  });


  it('throws an error if the response to a request is NOT ok', () => {
    mockFetch.mockReturnValue(badResponse);
    expect(async () => await fetchAPI.request<logoutResponseBody, logoutRequestBody>(path, {})).rejects.toThrow(badResponse.error());
  });
});
