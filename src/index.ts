import appConfig from './config/config.js';
import App from './app.js';
import logger from './utils/logger.js';

async function main(): Promise<void> {
    const app = new App(appConfig);

    const exitProgram = (signal: string): Promise<void> => {
        logger.info('Received %s, exiting...', signal);
        app.stop();
        process.exit(0);
    };

    process.on('SIGINT', async (signal) => await exitProgram(signal));
    process.on('SIGTERM', async (signal) => await exitProgram(signal));

    await app.start();
    await app.run();
}

try {
    await main();
} catch (err) {
    console.error(`An error occurred: ${err}`);
    process.exit(1);
}
