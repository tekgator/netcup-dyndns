import AddressType from './address-type.js';
import IpAddress from './ip-address.js';

export default interface PublicIpProvider {
    getPublicIp(addressType: AddressType): Promise<IpAddress[]>;
}
