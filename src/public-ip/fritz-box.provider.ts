import logger from '../utils/logger.js';
import AddressType from './address-type.js';
import IpAddress from './ip-address.js';
import PublicIpProvider from './public-ip.interface.js';
import axios from 'axios';

export default class FritzBoxProvider implements PublicIpProvider {
    private readonly httpClient = axios.create({
        timeout: 5000,
        headers: {
            Accept: 'text/xml',
            'Content-Type': 'text/xml; charset="utf-8"',
            SOAPACTION: 'urn:schemas-upnp-org:service:WANIPConnection:1#GetExternalIPAddress',
            'User-Agent': 'netcup-dyndns',
        },
    });

    private async getIp(): Promise<string> {
        const response = await this.httpClient.post(
            'http://fritz.box:49000/igdupnp/control/WANIPConn1',
            `<?xml version="1.0" encoding="utf-8"?>
                    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                        <s:Body>
                            <u:GetExternalIPAddress xmlns:u="urn:schemas-upnp-org:service:WANIPConnection:1" />
                        </s:Body>
                    </s:Envelope>`
        );
        if (response.status !== 200) throw new Error('Failed to get IP address');

        const data = response.data;

        const start = data.indexOf('<NewExternalIPAddress>') + '<NewExternalIPAddress>'.length;
        const end = data.indexOf('</NewExternalIPAddress>');

        if (start > 0 && end > start) {
            return data.substring(start, end);
        }

        return '';
    }

    async getPublicIp(addressType: AddressType = AddressType.Both): Promise<IpAddress[]> {
        const ipAddresses: IpAddress[] = [];
        const taskIp = this.getIp();

        try {
            await Promise.all([taskIp]);
        } catch (err) {
            const message = err instanceof Error ? err.message : '';
            logger.error('Failed to get public IP address from provider %s with error: %s', this.constructor.name, message);
        }

        const ip = new IpAddress(await taskIp);

        if ([AddressType.Both, AddressType.IPv4].includes(addressType) && ip.isValid() && ip.addressType === AddressType.IPv4) {
            ipAddresses.push(ip);
        }

        if ([AddressType.Both, AddressType.IPv6].includes(addressType) && ip.isValid() && ip.addressType === AddressType.IPv6) {
            ipAddresses.push(ip);
        }

        return ipAddresses;
    }
}
