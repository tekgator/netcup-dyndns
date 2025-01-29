import AddressType from './address-type.js';
import HttpTextProvider from './http-text.provider.js';
import IpAddress from './ip-address.js';
import PublicIpProvider from './public-ip.interface.js';

export default class IcanhazipProvider implements PublicIpProvider {
    private readonly httpTextProvider = new HttpTextProvider(
        this.constructor.name,
        'https://ipv4.icanhazip.com',
        'https://ipv6.icanhazip.com'
    );

    async getPublicIp(addressType: AddressType = AddressType.Both): Promise<IpAddress[]> {
        return this.httpTextProvider.getPublicIp(addressType);
    }
}
