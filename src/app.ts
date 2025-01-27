import {setTimeout} from 'timers/promises';
import {AppConfig} from './config/config.js';
import logger from './utils/logger.js';
import NetcupManager from './netcup/netcup.manager.js';

export default class App {
    private appConfig: AppConfig;
    private netcupManager: NetcupManager;

    constructor(appConfig: AppConfig) {
        this.appConfig = appConfig;
        this.netcupManager = new NetcupManager(appConfig);
    }

    public async start(): Promise<void> {
        logger.info('App started');
        logger.info('Configured refresh interval for dynamic DNS check is %ds', this.appConfig.refreshInterval / 1000);
    }

    public async run(): Promise<void> {
        while (true) {
            logger.info('Start checking for dynamic DNS update...');

            this.netcupManager.refreshDnsRecord();

            logger.debug('Waiting for %ds for next dynamic DNS check', this.appConfig.refreshInterval / 1000);
            await setTimeout(this.appConfig.refreshInterval);
        }
    }

    public stop(): void {
        logger.info('App stopped');
    }
}
