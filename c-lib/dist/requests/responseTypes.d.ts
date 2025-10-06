export type Success<T> = {
    success: true;
    payload: T;
};
export type Fail = {
    success: false;
    error: string;
};
export declare const Success: <T>(payload: T) => Success<T>;
export declare const Fail: (error: string) => Fail;
