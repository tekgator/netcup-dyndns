import winston from 'winston';

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                winston.format.padLevels(),
                winston.format.splat(),
                winston.format.colorize({level: true}),
                winston.format.printf((info) => {
                    return `${info.timestamp}: [${info.level}] ${info.message}`;
                })
            ),
        }),
    ],
});

export default logger;
