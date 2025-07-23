import { IndexerConfig } from "./interfaces";

class ConfigFacade {
    private static instance: ConfigFacade | null = null;
    private static config: IndexerConfig | null = null;

    private constructor() {}

    public static setConfig(config: IndexerConfig) {
        ConfigFacade.config = {
            rpcUrl: config.rpcUrl,
            logFilePath: config.logFilePath,
            refetchInterval: config.refetchInterval ?? 30000,
            batchSize: config.batchSize ?? 10000,
            lastBlockNumberFilePath: config.lastBlockNumberFilePath ?? "./.lastBlockNumber",
            txRepositoryFilePath: config.txRepositoryFilePath ?? "./.transactions.json",
            eventHandlerSleep: config.eventHandlerSleep,
            txRepository: config.txRepository,
            lastBlock: config.lastBlock
        };
    }

    public static getConfig() {
        return ConfigFacade.config;
    }

    public static getInstance() {
        if (!ConfigFacade.instance) {
            ConfigFacade.instance = new ConfigFacade();
        }
        return ConfigFacade.instance;
    }
}

export default ConfigFacade;