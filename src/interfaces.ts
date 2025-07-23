import type { EventLog, Log } from "ethers";
import type Contract from "./Contract";

export interface TransactionRepositoryInterface {
  existed(event: EventLog | Log, name: string): Promise<boolean>;
  submit(event: EventLog | Log, name: string): Promise<void>;
}

export interface ContractConstructor {
  new (transactionRepository?: TransactionRepositoryInterface): Contract;
}
