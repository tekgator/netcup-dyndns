export default interface DnsRecord {
    id: string;
    hostname: string;
    type: string;
    priority: string;
    destination: string;
    deleterecord: boolean;
    state: string;
}
