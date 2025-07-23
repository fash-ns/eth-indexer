import type { EventLog, Log } from "ethers";
import type IndexerContract from "./IndexerContract";
import winston from "winston";

export interface TransactionRepositoryInterface {
  existed(event: EventLog | Log, name: string): Promise<boolean>;
  submit(event: EventLog | Log, name: string): Promise<void>;
}

export interface ContractConstructor {
  new (transactionRepository?: TransactionRepositoryInterface): IndexerContract;
}

export interface IndexerConfig {
  rpcUrl: string;
  logFilePath: string;
  refetchInterval?: number;
  batchSize?: number;
  lastBlockNumberFilePath?: string;
  txRepositoryFilePath?: string;
  eventHandlerSleep?: number;
  txRepository?: TransactionRepositoryInterface;
  lastBlock?: number;
}

export type WinstonLogger = winston.Logger;
