export type Success<T> = {
  success: true;
  payload: T;
};

export type Fail = {
  success: false;
  error: string;
};

export const Success: <T>(payload: T) => Success<T> = <T>(payload: T) => ({
  success: true,
  payload
});

export const Fail: (error: string) => Fail = (error: string) => ({
  success: false,
  error
});