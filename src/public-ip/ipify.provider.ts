import AddressType from './address-type.js';
import HttpTextProvider from './http-text.provider.js';
import IpAddress from './ip-address.js';
import PublicIpProvider from './public-ip.interface.js';

export default class IpifyProvider implements PublicIpProvider {
    private readonly httpTextProvider = new HttpTextProvider(this.constructor.name, 'https://api.ipify.org', 'https://api6.ipify.org');

    async getPublicIp(addressType: AddressType = AddressType.Both): Promise<IpAddress[]> {
        return this.httpTextProvider.getPublicIp(addressType);
    }
}
