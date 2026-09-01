export class AppLogger {
    constructor(private readonly context: string) { }
    /**
     * Write a 'log' level log.
     */
    log(message: any, ...optionalParams: any[]) { console.log(`${this.context}: `, message, ...optionalParams); }

    /**
     * Write an 'error' level log.
     */
    error(message: any, ...optionalParams: any[]) { console.error(`${this.context}: `, message, ...optionalParams); }

    /**
     * Write a 'warn' level log.
     */
    warn(message: any, ...optionalParams: any[]) { console.warn(`${this.context}: `, message, ...optionalParams); }

    /**
     * Write a 'debug' level log.
     */
    debug(message: any, ...optionalParams: any[]) { console.log(`${this.context}: `, message, ...optionalParams); }

    /**
     * Write a 'verbose' level log.
     */
    verbose(message: any, ...optionalParams: any[]) { console.log(`${this.context}: `, message, ...optionalParams); }
}
