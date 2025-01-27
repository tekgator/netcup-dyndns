import ms, {StringValue} from 'ms';
import logger from '../utils/logger.js';
import PublicIpProvider from '../public-ip/public-ip.interface.js';
import AddressType from '../public-ip/address-type.js';
import {getDefaultPublicIpProvider, getPublicIpProvider} from '../public-ip/public-ip-providers.js';

export interface DomainConfig {
    zone: string;
    hosts: string[];
}

export class AppConfig {
    private _customerId: number;
    private _apiKey: string;
    private _apiPassword: string;
    private _refreshInterval: number;
    private _ipVersion: number;
    private _useCache: boolean = true;
    private _domainConfigs: DomainConfig[] = [];
    private _ipProviders: PublicIpProvider[] = [];

    constructor() {
        this._customerId = this.parseCustomerID();
        this._apiKey = this.parseApiKey();
        this._apiPassword = this.parseApiPassword();
        this._refreshInterval = this.parseRefreshInterval();
        this._ipVersion = this.parseIpVersion();
        this._useCache = this.parseUseCache();
        this._domainConfigs = this.parseDomainConfigs();
        this._ipProviders = this.parseIpProviders();
    }

    get customerId(): number {
        return this._customerId;
    }

    private parseCustomerID(): number {
        if (!process.env.CUSTOMER_ID || Number(process.env.CUSTOMER_ID) <= 0)
            throw new Error('Please provide a valid customer ID (CUSTOMER_ID)');

        const customerId = Number(process.env.CUSTOMER_ID);
        logger.debug('Customer ID: %d', customerId);

        return customerId;
    }

    get apiKey(): string {
        return this._apiKey;
    }

    private parseApiKey(): string {
        if (!process.env.API_KEY) throw new Error('Please provide a valid API key (API_KEY)');

        const apiKey = process.env.API_KEY;
        logger.debug('API Key: %s', apiKey);

        return apiKey;
    }

    get apiPassword(): string {
        return this._apiPassword;
    }

    private parseApiPassword(): string {
        if (!process.env.API_PASSWORD) throw new Error('Please provide a valid API password (API_PASSWORD)');

        const apiPassword = process.env.API_PASSWORD;
        logger.debug('API Password: %s', apiPassword);

        return apiPassword;
    }

    get refreshInterval(): number {
        return this._refreshInterval;
    }

    private parseRefreshInterval(): number {
        let refreshInterval = ms('5m' as StringValue);
        if (process.env.REFRESH_INTERVAL) {
            try {
                refreshInterval = ms(process.env.REFRESH_INTERVAL as StringValue);
                if (!refreshInterval || refreshInterval < 5000) throw new Error('Invalid Refresh Interval');
            } catch {
                throw new Error(
                    'Please provide a valid refresh Interval in the format e.g. 60s, 5m, 1h, 1d with a minimum of 5s interval (REFRESH_INTERVAL)'
                );
            }
        }
        logger.debug('Refresh Interval: %d', refreshInterval);

        return refreshInterval;
    }

    get ipVersion(): number {
        return this._ipVersion;
    }

    private parseIpVersion(): AddressType {
        let ipVersion = AddressType.IPv4;
        if (process.env.IP_VERSION) {
            try {
                ipVersion = Number(process.env.IP_VERSION);
                if (!Object.values(AddressType).includes(ipVersion)) throw new Error('Invalid IP Version');
            } catch {
                throw new Error('Please provide a valid IP Version in the format 0 - Both, 4 - IPv4, 6 - IPv4 (IP_VERSION)');
            }
        }
        logger.debug('IP Version: %d', ipVersion);

        return ipVersion;
    }

    get useCache(): boolean {
        return this._useCache;
    }

    private parseUseCache(): boolean {
        let useCache = true;

        if (process.env.USE_CACHE) {
            if (process.env.USE_CACHE === '1' || process.env.USE_CACHE === 'true') {
                useCache = true;
            } else if (process.env.USE_CACHE === '0' || process.env.USE_CACHE === 'false') {
                useCache = false;
            } else {
                throw new Error('Please provide a valid value for use cache in the format 0/false or 1/true (USE_CACHE)');
            }
        }
        logger.debug('Use Cache: %s', useCache);

        return useCache;
    }

    get domainConfigs(): DomainConfig[] {
        return this._domainConfigs;
    }

    private parseDomainConfigs(): DomainConfig[] {
        const domainConfigs: DomainConfig[] = [];

        let i = 0;
        while (true) {
            const domainConfig = this.parseDomainConfig(++i);
            if (!domainConfig) break;

            domainConfigs.push(domainConfig);
        }

        if (domainConfigs.length <= 0) throw new Error('Please provide at least one domain configuration (DOMAIN1, DOMAIN2, ...)');
        logger.debug('Domain Configs: %o', domainConfigs);

        return domainConfigs;
    }

    private parseDomainConfig(pos: number): DomainConfig | undefined {
        const domainConfig = process.env[`DOMAIN${pos}`];
        if (!domainConfig) return undefined;

        const parts = domainConfig.split(',');
        const zone = parts[0];

        if (!zone) throw new Error(`Please provide a valid zone for domain ${pos} (DOMAIN${pos})`);

        let hosts: string[] = [];
        if (parts.length > 1) {
            hosts = parts.slice(1);
        }

        return {zone, hosts};
    }

    get ipProviders(): PublicIpProvider[] {
        return this._ipProviders;
    }

    private parseIpProviders(): PublicIpProvider[] {
        let ipProviders: PublicIpProvider[] = [];
        let i = 0;
        while (true) {
            const ipProvider = this.parseIpProvider(++i);
            if (!ipProvider) break;

            ipProviders.push(ipProvider);
        }

        if (ipProviders.length <= 0) {
            ipProviders = getDefaultPublicIpProvider();
        }

        logger.debug(
            'IP Providers: %o',
            ipProviders.map((ipProvider) => ipProvider.constructor.name)
        );

        return ipProviders;
    }

    private parseIpProvider(pos: number): PublicIpProvider | undefined {
        const ipProviderStr = process.env[`IP_PROVIDER${pos}`];
        if (!ipProviderStr) return undefined;

        const ipProvider = getPublicIpProvider(ipProviderStr);

        if (ipProvider === null) throw new Error(`Provided IP provider '${ipProviderStr}' is invalid (IP_PROVIDER${pos})`);

        return ipProvider;
    }
}

export default new AppConfig();
