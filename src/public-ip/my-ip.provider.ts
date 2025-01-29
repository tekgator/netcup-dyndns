import AddressType from './address-type.js';
import HttpTextProvider from './http-text.provider.js';
import IpAddress from './ip-address.js';
import PublicIpProvider from './public-ip.interface.js';

export default class MyIpProvider implements PublicIpProvider {
    private readonly httpTextProvider = new HttpTextProvider(
        this.constructor.name,
        'https://api4.my-ip.io/v1/ip',
        'https://api6.my-ip.io/v1/ip'
    );

    async getPublicIp(addressType: AddressType = AddressType.Both): Promise<IpAddress[]> {
        return this.httpTextProvider.getPublicIp(addressType);
    }
}
