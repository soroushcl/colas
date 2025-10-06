import { Success, Fail } from '../index';
import { BreedListResponse, BreedListRequestBody } from '../../breeds';

export type getBreedsResponseBody = Success<BreedListResponse> | Fail;

export interface getBreedsRequestBody extends BreedListRequestBody {}
