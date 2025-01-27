import AddressType from './address-type.js';
import * as net from 'net';

export default class IpAddress {
    private _ip: string;
    private _addressType: AddressType;

    constructor(ip: string) {
        this._ip = ip;

        this._addressType = AddressType.Both;
        if (net.isIPv4(ip)) {
            this._addressType = AddressType.IPv4;
        } else if (net.isIPv6(ip)) {
            this._addressType = AddressType.IPv6;
        }
    }

    get ip(): string {
        return this._ip;
    }

    get addressType(): AddressType {
        return this._addressType;
    }

    public isValid(): boolean {
        return this._addressType !== AddressType.Both;
    }

    public isIpV4(): boolean {
        return this._addressType === AddressType.IPv4;
    }

    public isIpV6(): boolean {
        return this._addressType === AddressType.IPv6;
    }

    public toString(): string {
        return this._ip;
    }
}
