import BaseResponse from './response.base.js';

export default interface Response<T> extends BaseResponse {
    responsedata: T;
}
