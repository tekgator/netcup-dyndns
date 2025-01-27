import AuthRequest from './auth.request.js';
import DnsRecordSet from './dnsRecordSet.js';

export default interface UpdateDnsRecordsRequest extends AuthRequest {
    domainname: string;
    dnsrecordset: DnsRecordSet;
}
