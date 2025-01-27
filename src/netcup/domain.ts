export default class Domain {
    private _zone: string;
    private _hosts: string[];
    private _ipv4?: string;
    private _ipv6?: string;

    constructor(zone: string, hosts: string[]) {
        this._zone = zone;
        this._hosts = hosts;
    }

    get zone(): string {
        return this._zone;
    }

    get hosts(): string[] {
        return this._hosts;
    }

    set ipv4(ipv4: string | undefined) {
        this._ipv4 = ipv4;
    }

    get ipv4(): string | undefined {
        return this._ipv4;
    }

    set ipv6(ipv6: string | undefined) {
        this._ipv6 = ipv6;
    }

    get ipv6(): string | undefined {
        return this._ipv6;
    }
}
