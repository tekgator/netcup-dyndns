import FritzBoxProvider from './fritz-box.provider.js';
import IcanhazipProvider from './icanhazip.provider.js';
import IdentMeProvider from './identme.provider.js';
import IpifyProvider from './ipify.provider.js';
import MyIpProvider from './my-ip.provider.js';
import PublicIpProvider from './public-ip.interface.js';
import RandomIpProvider from './random-ip.provider.js';
import SeeIpProvider from './seeip.provider.js';

const publicIpProviders: {[key: string]: new () => PublicIpProvider} = {
    icanhazip: IcanhazipProvider,
    ipify: IpifyProvider,
    identme: IdentMeProvider,
    myip: MyIpProvider,
    seeip: SeeIpProvider,
    fritzbox: FritzBoxProvider,
    randomip: RandomIpProvider,
};

/**
 * Returns a public IP provider instance based on the provider name.
 * @param providerName Name of the provider. Case-insensitive. Must be one of the keys in the publicIpProviders object.
 * @returns The provider instance if the provider name is valid, otherwise null.
 */
export function getPublicIpProvider(providerName: string): PublicIpProvider | null {
    if (!(providerName.toLowerCase() in publicIpProviders)) return null;
    return new publicIpProviders[providerName]();
}

export function getDefaultPublicIpProvider(): PublicIpProvider[] {
    return Object.keys(publicIpProviders)
        .filter((pn) => pn !== 'fritzbox' && pn !== 'randomip')
        .map((pn) => new publicIpProviders[pn]());
}
