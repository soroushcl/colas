import { Fail, Success } from "../responseTypes";
export interface downloadFileRequestBody {
    filePath: string;
}
export type downloadFileResponseBody = Success<string> | Fail;
