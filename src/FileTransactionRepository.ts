import type { TransactionRepositoryInterface } from "./interfaces";
import type { EventLog, Log } from "ethers";
import * as fs from "fs";

class FileTransactionRepository implements TransactionRepositoryInterface {
  private filePath: string;

  constructor() {
    this.filePath = process.env.TX_REPOSITORY_FILE_PATH ?? ".transactions.json";
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  async existed(event: EventLog | Log, name: string): Promise<boolean> {
    const transactions = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
    const tx = transactions.filter(
      (tx: any) =>
        tx.name === name &&
        tx.transactionHash === event.transactionHash &&
        tx.blockHash === event.blockHash &&
        tx.index === event.index &&
        tx.blockNumber === event.blockNumber &&
        tx.address === event.address &&
        tx.data === event.data &&
        tx.topics === event.topics &&
        tx.transactionIndex === event.transactionIndex,
    );
    return tx.length > 0;
  }

  async submit(event: EventLog | Log, name: string): Promise<void> {
    const transactions = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
    transactions.push({
      name: name,
      transactionHash: event.transactionHash,
      blockHash: event.blockHash,
      index: event.index,
      blockNumber: event.blockNumber,
      address: event.address,
      data: event.data,
      topics: event.topics,
      transactionIndex: event.transactionIndex,
    });
    fs.writeFileSync(this.filePath, JSON.stringify(transactions));
  }
}

export default FileTransactionRepository;
