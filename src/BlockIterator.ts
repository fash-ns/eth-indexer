import JsonRPCProvider from "./JsonRPCProvider";
import { JsonRpcProvider as EthersJsonRpcProvider } from "ethers";
import * as fs from "fs";
import IndexerContract from "./IndexerContract";
import winston from "winston";
import Logger from "./Logger";
import ConfigFacade from "./ConfigFacade";

class BlockIterator {
  private readonly instances: Set<IndexerContract>;
  private readonly rpcProvider: EthersJsonRpcProvider;
  private readonly logger: winston.Logger;
  private readonly lastBlock?: number;

  constructor(instances: Set<IndexerContract>, lastBlock?: number) {
    this.instances = instances;
    this.lastBlock = lastBlock;
    this.rpcProvider = JsonRPCProvider.getInstance();
    this.logger = Logger.getInstance();
    this.logger.defaultMeta = { scope: "Iterator" };
  }

  public async fetchEvents() {
    const lastFetchedBlockNumber = fs.existsSync(".lastBlockNumber")
      ? parseInt(fs.readFileSync(".lastBlockNumber").toString())
      : null;
    let minBlockNumber = Number.MAX_SAFE_INTEGER;

    this.instances.forEach((instance) => {
      const blockNumber = instance.getInitialBlockNumber();
      if (blockNumber < minBlockNumber) minBlockNumber = blockNumber;
    });

    let fromBlock =
      lastFetchedBlockNumber !== null ? lastFetchedBlockNumber : minBlockNumber;
    this.logger.info(`Starting from block ${fromBlock}`);

    let lastBlock;

    if (this.lastBlock) {
      this.logger.warn(
        `Last block number is set to ${this.lastBlock} manually. Indexer will not become live.`,
      );
      lastBlock = this.lastBlock;
    } else {
      lastBlock = (await this.rpcProvider.getBlock("latest"))!.number;
    }

    this.logger.info(`Last block in blockchain is ${lastBlock}`);

    while (fromBlock <= lastBlock) {
      let toBlock = Math.min(lastBlock, fromBlock + ConfigFacade.getConfig()?.batchSize!);

      for (const instance of this.instances) {
        this.logger.info(`Fetching events for ${instance.getName()}`);
        await instance.fetchHistoricalEvents(fromBlock, toBlock);
      }
      fromBlock = toBlock + 1;
      fs.writeFileSync(".lastBlockNumber", fromBlock.toString());
      this.logger.info(`Updated last fetched block number to ${fromBlock}`);
    }
    if (this.lastBlock) {
      this.logger.info(`Indexer reached manual-set last block number`);
    } else {
      const refetchInterval = ConfigFacade.getConfig()?.refetchInterval!
      this.logger.info(
        `Indexer is now sync with real-time blockchain data. Waiting ${refetchInterval / 1000} seconds to refetch events`,
      );
      setTimeout(() => {
        this.fetchEvents();
      }, refetchInterval);
    }
  }
}

export default BlockIterator;
