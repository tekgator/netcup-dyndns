import AuthRequest from './auth.request.js';

export default interface InfoDnsRecordsRequest extends AuthRequest {
    domainname: string;
}
