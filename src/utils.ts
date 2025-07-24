import BlockIterator from "./BlockIterator";
import ConfigFacade from "./ConfigFacade";
import type IndexerContract from "./IndexerContract";
import type { ContractConstructor, IndexerConfig } from "./interfaces";

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const initiate = (
  classes: ContractConstructor[],
  config: IndexerConfig,
) => {
  const classInstances: Set<IndexerContract> = new Set<IndexerContract>();

  ConfigFacade.getInstance();
  ConfigFacade.setConfig(config);

  classes.forEach((ContractClass) => {
    const instance = new ContractClass();
    instance.init();
    classInstances.add(instance);
  });

  const blockIterator = new BlockIterator(
    classInstances,
    ConfigFacade.getConfig()?.lastBlock,
  );
  blockIterator.fetchEvents();
};
