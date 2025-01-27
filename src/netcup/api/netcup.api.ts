import axios, {AxiosResponse} from 'axios';
import Request from './request.js';
import Response from './repsonse.js';
import LoginRequest from './login.request.js';
import LoginResponse from './login.response.js';
import InfoDnsRecordsRequest from './infoDnsRecords.request.js';
import UpdateDnsRecordsRequest from './updateDnsRecords.request.js';
import DnsRecordSet from './dnsRecordSet.js';
import DnsRecord from './dnsRecord.js';
import AuthRequest from './auth.request.js';

export default class NetcupApi {
    private readonly httpClient = axios.create({
        baseURL: 'https://ccp.netcup.net/run/webservice/servers/endpoint.php?JSON',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'netcup-dyndns',
        },
        timeout: 5000,
    });

    private async postRequest<T, R>(data: Request<T>): Promise<Response<R>> {
        const res = await this.httpClient.post<Response<R>, AxiosResponse<Response<R>>, Request<T>>('', data);

        if (res.status >= 200 && res.status < 300 && res.data && res.data.statuscode >= 2000 && res.data.statuscode < 3000) {
            return res.data;
        }

        const errorMessage =
            res.data instanceof Response ? res.data.longmessage || res.data.shortmessage || 'Unknown error' : 'Request failed';

        throw new Error(`Netcup API request '${data.action}' failed: ${errorMessage}`);
    }

    public async login(params: LoginRequest): Promise<string> {
        const res = await this.postRequest<LoginRequest, LoginResponse>({
            action: 'login',
            param: params,
        });

        return res.responsedata.apisessionid;
    }

    public async logout(params: AuthRequest): Promise<void> {
        await this.postRequest<AuthRequest, void>({
            action: 'logout',
            param: params,
        });
    }

    public async infoDnsRecords(params: InfoDnsRecordsRequest): Promise<DnsRecord[]> {
        const res = await this.postRequest<InfoDnsRecordsRequest, DnsRecordSet>({
            action: 'infoDnsRecords',
            param: params,
        });

        return res.responsedata.dnsrecords;
    }

    public async updateDnsRecords(params: UpdateDnsRecordsRequest): Promise<DnsRecord[]> {
        const res = await this.postRequest<UpdateDnsRecordsRequest, DnsRecordSet>({
            action: 'updateDnsRecords',
            param: params,
        });

        return res.responsedata.dnsrecords;
    }
}
