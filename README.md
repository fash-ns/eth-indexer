# Eth Indexer

**Eth Indexer** is a lightweight and efficient tool for indexing EVM-based blockchain events.
It fetches filtered events and passes them to a custom handler defined by you.

---

## ✨ Features

- Indexes historical and live blockchain events.
- Prevents duplicate event processing using a customizable storage strategy.
- Simple and extensible architecture.
- Easy to configure with batching and delay support.

---

## 🚀 How It Works

`argus-indexer` queries the blockchain using the RPC provider and contract ABIs you supply. It:

1. Fetches and parses events using [`ethers.js`](https://docs.ethers.org/).
2. Delivers both raw and parsed events to your custom handler.
3. Ensures event processing order matches the order of your provided contracts — useful when contracts are interdependent.

### Example Use Case

Suppose you have:

- An ERC-721 NFT contract
- A Market contract referencing token IDs from the NFT contract

In this case, provide the NFT contract first so its data is available before processing market events.

---

## 🛠️ Usage

### 1. Create a Contract Class

Extend the `IndexerContract` abstract class and define how events should be handled:

```ts
import { IndexerContract } from "argus-indexer";

class MarketContract extends IndexerContract {
  protected contractAddress = "0x..."; // Contract address
  protected contractAbi: ethers.InterfaceAbi = {}; // Contract ABI
  protected initialBlockNumber = 0; // Starting block number. It's usually the number of the block which the contract is deployed on.
  protected name = "Market"; // Contract name for logs

  public queryFilter(): ethers.ContractEventName {
    return "*"; // Catch all events.
  }

  public async handleEvent(
    parsedEvent: ethers.LogDescription | null,
    event: ethers.EventLog | ethers.Log,
  ): Promise<void> {
    // Your custom event handler logic. E.g: Save the event details
    console.log(`Fetched ${parsedEvent.name}: ${parsedEvent?.args?.order_id}`);
  }
}
```

### 2. Start Indexing

Call the `initiate()` function with your contract classes and config:

```ts
import { initiate } from "argus-indexer";

initiate([NFTContract, MarketContract], {
  rpcUrl: "https://your-rpc-url",
  logFilePath: "logs.log",
  eventHandlerSleep: 200,
  refetchInterval: 30000,
  batchSize: 10000,
  txRepositoryFilePath: "transactions.json",
  lastBlock: 72000000,
  txRepository: new TransactionRepository(),
});
```

---

## ⚙️ Configuration Options

| Key                    | Required | Description                                                                  |
| ---------------------- | -------- | ---------------------------------------------------------------------------- |
| `rpcUrl`\*             | ✅       | Full URL of your JSON-RPC provider                                           |
| `logFilePath`\*        | ✅       | Path to your log file                                                        |
| `eventHandlerSleep`    | ❌       | Delay (in ms) between event handling, useful for rate-limiting. Default: `0` |
| `refetchInterval`      | ❌       | Polling interval (in ms) for live events. Default: `30000`                   |
| `batchSize`            | ❌       | Block range per fetch. Adjust to avoid RPC limits. Default: `10000`          |
| `txRepositoryFilePath` | ❌       | File path for storing handled events. Default: `./.transactions.json`        |
| `lastBlock`            | ❌       | Stop indexing at this block. Useful for snapshots.                           |
| `txRepository`         | ❌       | Custom handler to manage processed events (see below)                        |

---

## 🧩 Custom Transaction Repository

To avoid re-processing events, you can provide a custom event storage strategy by implementing the `TransactionRepositoryInterface`. Example using Prisma:

```ts
import { ethers } from "argus-indexer";
import type { TransactionRepositoryInterface } from "argus-indexer";
import { PrismaClient } from "@prisma/client";

class TransactionRepository implements TransactionRepositoryInterface {
  protected prisma = new PrismaClient();

  constructor() {
    this.prisma.$connect();
  }

  public async submit(
    event: ethers.EventLog | ethers.Log,
    name: string | null,
  ) {
    await this.prisma.transaction.create({
      data: {
        eventName: name ?? "",
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
        blockNumber: event.blockNumber,
        address: event.address,
        data: event.data,
        topics: event.topics.toString(),
        transactionIndex: event.transactionIndex,
      },
    });
  }

  public async existed(
    event: ethers.EventLog | ethers.Log,
    name: string | null,
  ) {
    const existedTx = await this.prisma.transaction.findFirst({
      where: {
        eventName: name ?? "",
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
        blockNumber: event.blockNumber,
        address: event.address,
        data: event.data,
        topics: event.topics.toString(),
        transactionIndex: event.transactionIndex,
      },
    });
    return !!existedTx;
  }
}
```

**Note:** It's strongly recommended to store all event attributes to ensure accurate duplication checks.

---

## 🔧 Built-in Helpers in `IndexerContract`

Each class that extends `IndexerContract` has access to:

| Property                 | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `this.logger`            | A pre-configured [winston](https://github.com/winstonjs/winston) logger |
| `this.rpcProvider`       | An `ethers.JsonRpcProvider` using your RPC URL                          |
| `this.contractInstance`  | An `ethers.Contract` instance of your contract                          |
| `this.contractInterface` | An `ethers.Interface` for advanced parsing                              |

You can also use any part of `ethers.js` by importing directly from `argus-indexer`.

---

## 📬 Contributing & Questions

Have a question, bug report, or feature request? Feel free to [open an issue](https://github.com/fash-ns/eth-indexer/issues) — contributions are welcome!
