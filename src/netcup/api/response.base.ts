export default interface BaseResponse {
    action: string;
    clientrequestid?: string;
    longmessage?: string;
    serverrequestid: string;
    shortmessage: string;
    status: string;
    statuscode: number;
}
