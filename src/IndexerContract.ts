import { ethers } from "ethers";
import JsonRPCProvider from "./JsonRPCProvider";
import Logger from "./Logger";
import { sleep } from "./utils";
import type {
  TransactionRepositoryInterface,
  WinstonLogger,
} from "./interfaces";
import FileTransactionRepository from "./FileTransactionRepository";
import ConfigFacade from "./ConfigFacade";

abstract class IndexerContract {
  protected contractAddress!: string;
  protected contractAbi!: ethers.InterfaceAbi;
  protected initialBlockNumber: number = 0;
  protected name!: string;
  protected logger!: WinstonLogger;

  protected rpcProvider!: ethers.JsonRpcProvider;
  protected contractInstance!: ethers.Contract;
  protected contractInterface!: ethers.Interface;
  private transactionRepository: TransactionRepositoryInterface;

  constructor() {
    const transactionRepository = ConfigFacade.getConfig()?.txRepository;
    this.transactionRepository =
      transactionRepository ?? new FileTransactionRepository();
  }

  public init() {
    this.rpcProvider = JsonRPCProvider.getInstance();
    this.contractInstance = new ethers.Contract(
      this.contractAddress,
      this.contractAbi,
      this.rpcProvider,
    );
    this.contractInterface = new ethers.Interface(this.contractAbi);
    this.logger = Logger.getInstance();
    this.logger.defaultMeta = { scope: this.name };
  }

  public getInitialBlockNumber() {
    return this.initialBlockNumber;
  }

  public getName() {
    return this.name;
  }

  public abstract queryFilter(): ethers.ContractEventName;

  private async fetchEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<(ethers.EventLog | ethers.Log)[]> {
    try {
      const events = await this.contractInstance.queryFilter(
        this.queryFilter(),
        fromBlock,
        toBlock,
      );
      return events;
    } catch (error: any) {
      this.logger.warn(
        `Error fetching events for contract ${this.name}. Reason: ${error.message}. Retrying...`,
      );
      await sleep(5000);
      return await this.fetchEvents(fromBlock, toBlock);
    }
  }

  public async fetchHistoricalEvents(fromBlock: number, toBlock: number) {
    const events = await this.fetchEvents(fromBlock, toBlock);
    this.logger.info(`Fetched ${events.length} events for contract`, {
      contractName: this.name,
    });
    for (const event of events) {
      const parsedEvent = this.contractInterface.parseLog(event);
      this.logger.info(
        `Passing event ${parsedEvent?.name} to the handler. Tx: ${event.transactionHash}`,
      );
      const existedTx = await this.transactionRepository.existed(
        event,
        parsedEvent?.name ?? "unknown event",
      );
      // this.logger.info(`event index: ${event.index}, tx: ${event.transactionHash}`);
      if (existedTx) {
        this.logger.warn(`This event is already processed.`);
        continue;
      }
      await this.handleEvent(parsedEvent, event);
      await sleep(200);
      await this.transactionRepository.submit(
        event,
        parsedEvent?.name ?? "unknown event",
      );
    }
  }

  public abstract handleEvent(
    parsedEvent: ethers.LogDescription | null,
    event: ethers.EventLog | ethers.Log,
  ): Promise<void>;
}

export default IndexerContract;
