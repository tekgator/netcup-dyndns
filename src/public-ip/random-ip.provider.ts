import logger from '../utils/logger.js';
import AddressType from './address-type.js';
import IpAddress from './ip-address.js';
import PublicIpProvider from './public-ip.interface.js';

export default class RandomIpProvider implements PublicIpProvider {
    private async getIpV4(): Promise<string> {
        return (
            Math.floor(Math.random() * 255) +
            1 +
            '.' +
            Math.floor(Math.random() * 255) +
            '.' +
            Math.floor(Math.random() * 255) +
            '.' +
            Math.floor(Math.random() * 255)
        );
    }

    private async getIpV6(): Promise<string> {
        const mac = 'XX:XX:XX:XX:XX:XX'.replace(/X/g, function () {
            return '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16));
        });

        const macPart = mac.split(':')[0];
        const macPartAsNumber = parseInt(macPart, 16); // Parse as hexadecimal
        if (!isNaN(macPartAsNumber)) {
            return ''.concat(
                '2001:db8:',
                ':',
                (macPartAsNumber ^ 2).toString(16), // Convert back to hexadecimal string
                mac.split(':')[1],
                ':',
                mac.split(':')[2],
                'ff',
                ':',
                'fe',
                mac.split(':')[3],
                ':',
                mac.split(':')[4],
                mac.split(':')[5]
            );
        } else {
            // Handle the case where the string cannot be parsed
            throw new Error(`Invalid MAC address part: ${macPart}`);
        }
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
