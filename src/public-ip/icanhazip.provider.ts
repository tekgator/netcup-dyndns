import logger from '../utils/logger.js';
import AddressType from './address-type.js';
import IpAddress from './ip-address.js';
import PublicIpProvider from './public-ip.interface.js';
import axios from 'axios';

export default class IcanhazipProvider implements PublicIpProvider {
    private readonly httpClient = axios.create({
        timeout: 5000,
        headers: {
            Accept: 'text/plain',
            'User-Agent': 'netcup-dyndns',
        },
    });
    private readonly ip4Url: string = 'https://ipv4.icanhazip.com';
    private readonly ip6Url: string = 'https://ipv6.icanhazip.com';
    private readonly regexNewLine: RegExp = /\r?\n|\r/g;

    private async getIpV4(): Promise<string> {
        const response = await this.httpClient.get(this.ip4Url);
        if (response.status !== 200) throw new Error('Failed to get IPv4 address');
        return response.data.replace(this.regexNewLine, '');
    }

    private async getIpV6(): Promise<string> {
        const response = await this.httpClient.get(this.ip6Url);
        if (response.status !== 200) throw new Error('Failed to get IPv6 address');
        return response.data.replace(this.regexNewLine, '');
    }

    async getPublicIp(addressType: AddressType = AddressType.Both): Promise<IpAddress[]> {
        const ipAddresses: IpAddress[] = [];
        const taskIpv4 = [AddressType.Both, AddressType.IPv4].includes(addressType) ? this.getIpV4() : Promise.resolve('');
        const taskIpv6 = [AddressType.Both, AddressType.IPv6].includes(addressType) ? this.getIpV6() : Promise.resolve('');

        try {
            await Promise.all([taskIpv4, taskIpv6]);
        } catch (err) {
            const message = err instanceof Error ? err.message : '';
            logger.error('Failed to get public IP address from provider %s with error: %s', this.constructor.name, message);
        }

        const ipv4 = new IpAddress(await taskIpv4);
        const ipv6 = new IpAddress(await taskIpv6);

        if ([AddressType.Both, AddressType.IPv4].includes(addressType) && ipv4.isValid()) {
            ipAddresses.push(ipv4);
        }

        if ([AddressType.Both, AddressType.IPv6].includes(addressType) && ipv6.isValid()) {
            ipAddresses.push(ipv6);
        }

        return ipAddresses;
    }
}
