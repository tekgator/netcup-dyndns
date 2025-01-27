//import {DnsRecord, NetcupRestApi} from 'netcup-node';
import {AppConfig} from '../config/config.js';
import IpAddress from '../public-ip/ip-address.js';
import AddressType from '../public-ip/address-type.js';
import Domain from './domain.js';
import logger from '../utils/logger.js';
import NetcupApi from './api/netcup.api.js';
import DnsRecord from './api/dnsRecord.js';

export default class NetcupManager {
    //private api = new NetcupRestApi();
    private api = new NetcupApi();
    private appConfig: AppConfig;
    private domains: Domain[] = [];

    private apiSessionId?: string;

    constructor(appConfig: AppConfig) {
        this.appConfig = appConfig;
        this.domains = appConfig.domainConfigs.map((domainConfig) => new Domain(domainConfig.zone, domainConfig.hosts));
    }

    public async refreshDnsRecord(): Promise<void> {
        try {
            // 1.) get the public IP address
            const ipAddresses = await this.getPublicIp();

            // 2.) verify each domain whether the IP address has changed
            for (const domain of this.domains) {
                // 3.) if useCache is enabled and if IP address has not changed skip the domain
                if (this.appConfig.useCache && !this.hasIpAddressChanged(domain, ipAddresses)) continue;

                // 4.) check and update the DNS records for the domain
                await this.checkAndUpdateDnsRecords(domain, ipAddresses);

                this.logout();
            }
        } catch (err) {
            /* ignore errors and retry next time e.g. maybe no internt connection, etc.*/
            if (err instanceof Error) logger.error(err.message);
        }

        this.logout();
    }

    /**
     * Logs out from the Netcup API.
     */
    private async logout(): Promise<void> {
        if (!this.apiSessionId) return;

        try {
            await this.api.logout({
                customernumber: this.appConfig.customerId,
                apikey: this.appConfig.apiKey,
                apisessionid: this.apiSessionId,
            });
        } catch (err) {
            logger.warn('Failed to logout from Netcup API: %s', err instanceof Error ? err.message : '');
        }

        this.apiSessionId = undefined;
    }

    /**
     * Logs in to the Netcup API.
     */
    private async login(): Promise<void> {
        if (this.apiSessionId) return;

        const sessionId = await this.api.login({
            customernumber: this.appConfig.customerId,
            apikey: this.appConfig.apiKey,
            apipassword: this.appConfig.apiPassword,
        });

        this.apiSessionId = sessionId;
    }

    /**
     * Get the DNS records for a specific zone from Netcup.
     */
    private async getDnsRecords(zone: string): Promise<DnsRecord[]> {
        await this.login();

        const dnsRecords = await this.api.infoDnsRecords({
            customernumber: this.appConfig.customerId,
            apikey: this.appConfig.apiKey,
            apisessionid: this.apiSessionId!,
            domainname: zone,
        });

        await this.logout();

        return dnsRecords;
    }

    /**
     * Update the DNS records for a specific zone in Netcup.
     */
    private async updateDnsRecords(zone: string, dnsRecords: DnsRecord[]): Promise<void> {
        await this.login();

        await this.api.updateDnsRecords({
            domainname: zone,
            customernumber: this.appConfig.customerId,
            apikey: this.appConfig.apiKey,
            apisessionid: this.apiSessionId!,
            dnsrecordset: {
                dnsrecords: dnsRecords,
            },
        });

        await this.logout();
    }

    /**
     * Get the current public IP address.
     */
    private async getPublicIp(): Promise<IpAddress[]> {
        const ipAddresses: IpAddress[] = [];

        for (const provider of this.appConfig.ipProviders) {
            try {
                ipAddresses.push(...(await provider.getPublicIp(this.appConfig.ipVersion)));
            } catch (_err) {
                /* ignore if a provider is not available, try next */
            }

            const hasIPv4 = ipAddresses.some((ip) => ip.addressType === AddressType.IPv4);
            const hasIPv6 = ipAddresses.some((ip) => ip.addressType === AddressType.IPv6);

            if (
                (this.appConfig.ipVersion === AddressType.Both && hasIPv4 && hasIPv6) ||
                (this.appConfig.ipVersion === AddressType.IPv4 && hasIPv4) ||
                (this.appConfig.ipVersion === AddressType.IPv6 && hasIPv6)
            ) {
                break;
            }
        }

        const hasIPv4 = ipAddresses.some((ip) => ip.addressType === AddressType.IPv4);
        const hasIPv6 = ipAddresses.some((ip) => ip.addressType === AddressType.IPv6);

        if (
            (this.appConfig.ipVersion === AddressType.Both && (!hasIPv4 || !hasIPv6)) ||
            (this.appConfig.ipVersion === AddressType.IPv4 && !hasIPv4) ||
            (this.appConfig.ipVersion === AddressType.IPv6 && !hasIPv6)
        ) {
            // no public IP address found
            throw new Error('Could not get public IP address from IP providers');
        }

        for (const ip of ipAddresses) {
            logger.info('Current public %s address: %s', ip.isIpV4() ? 'IPv4' : 'IPv6', ip.toString());
        }

        return ipAddresses;
    }

    /**
     * Check whether the IP address has changed for a specific domain
     */
    private hasIpAddressChanged(domain: Domain, ipAddresses: IpAddress[]): boolean {
        let hasChanged = false;

        if ([AddressType.Both, AddressType.IPv4].includes(this.appConfig.ipVersion)) {
            const ipv4Domain = domain.ipv4;
            const ipv4Public = ipAddresses.find((ip) => ip.isIpV4())?.toString();

            if (!ipv4Domain || ipv4Domain !== ipv4Public) hasChanged = true;
        }

        if ([AddressType.Both, AddressType.IPv6].includes(this.appConfig.ipVersion)) {
            const ipv6Domain = domain.ipv6;
            const ipv6Public = ipAddresses.find((ip) => ip.isIpV6())?.toString();

            if (!ipv6Domain || ipv6Domain !== ipv6Public) hasChanged = true;
        }

        if (hasChanged) {
            logger.info(`Domain '%s' IP address maybe outdated and needs to be updated`, domain.zone);
        } else {
            logger.info(`Domain '%s' IP Address is up to date`, domain.zone);
        }

        return hasChanged;
    }

    /**
     * Update the DNS records for a specific domain.
     */
    private async checkAndUpdateDnsRecords(domain: Domain, ipAddresses: IpAddress[]): Promise<void> {
        const ipv4Public = ipAddresses.find((ip) => ip.isIpV4());
        const ipv6Public = ipAddresses.find((ip) => ip.isIpV6());

        const ipVersions: string[] = [];
        if (ipv4Public) ipVersions.push('A');
        if (ipv6Public) ipVersions.push('AAAA');

        logger.info(`Fetching DNS records for domain '%s' from Netcup`, domain.zone);
        const dnsRecords = await this.getDnsRecords(domain.zone);

        // filter the DNS records by the IP version based on available public IP addresses

        // BUGFIX: when executing the filter here it crashes Node for whatever reason, therfore moved to own function
        // const dnsRecordsToUpdate = dnsRecords.filter(
        //     (record) => ipVersions.includes(record.type) && (domain.hosts.length === 0 || domain.hosts.includes(record.hostname))
        // );
        const dnsRecordsToUpdate = this.filterDnsRecords(dnsRecords, ipVersions, domain.hosts);

        // if hosts are defined for the domain, check whether those are existing in the DNS records
        if (domain.hosts.length > 0) {
            for (const host of domain.hosts) {
                for (const ipVersion of ipVersions) {
                    if (!dnsRecordsToUpdate.some((record) => record.hostname === host && record.type === ipVersion)) {
                        logger.warn(
                            `Could not find DNS record for host '%s' of type '%s' in domain '%s', please check your configuration or create a new DNS record in the Netcup control panel`,
                            host,
                            ipVersion,
                            domain.zone
                        );
                    }
                }
            }
        }

        let updateDnsRecords = false;
        for (const dnsRecord of dnsRecordsToUpdate) {
            const newDestination = dnsRecord.type === 'A' ? ipv4Public?.toString() : ipv6Public?.toString();
            if (!newDestination || dnsRecord.destination === newDestination) continue;

            logger.info(
                `Updating DNS record of type '%s' for '%s' from '%s' to '%s'`,
                dnsRecord.type,
                dnsRecord.hostname,
                dnsRecord.destination,
                newDestination
            );

            dnsRecord.destination = newDestination.toString();
            updateDnsRecords = true;
        }

        // update the DNS records at Netcup
        if (updateDnsRecords) {
            logger.info(`Executing update of DNS records for domain '%s' at Netcup`, domain.zone);
            await this.updateDnsRecords(domain.zone, dnsRecordsToUpdate);
        } else {
            logger.info(`All DNS records for domain '%s' are up to date`, domain.zone);
        }

        // update IP cache of the domain
        domain.ipv4 = ipv4Public?.toString();
        domain.ipv6 = ipv6Public?.toString();
    }

    private filterDnsRecords(dnsRecords: DnsRecord[], ipVersions: string[], hosts: string[]): DnsRecord[] {
        const fileredDnsRecords: DnsRecord[] = [];

        for (const dnsRecord of dnsRecords) {
            if (ipVersions.includes(dnsRecord.type) && (hosts.length === 0 || hosts.includes(dnsRecord.hostname))) {
                fileredDnsRecords.push(dnsRecord);
            }
        }

        return fileredDnsRecords;
    }
}
