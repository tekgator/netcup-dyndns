import AddressType from './address-type.js';
import HttpTextProvider from './http-text.provider.js';
import IpAddress from './ip-address.js';
import PublicIpProvider from './public-ip.interface.js';

export default class IdentMeProvider implements PublicIpProvider {
    private readonly httpTextProvider = new HttpTextProvider(this.constructor.name, 'https://4.ident.me', 'https://6.ident.me');

    async getPublicIp(addressType: AddressType = AddressType.Both): Promise<IpAddress[]> {
        return this.httpTextProvider.getPublicIp(addressType);
    }
}
