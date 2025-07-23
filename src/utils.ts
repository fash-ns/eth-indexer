import BlockIterator from "./BlockIterator";
import type Contract from "./Contract";
import type {
  ContractConstructor,
  TransactionRepositoryInterface,
} from "./interfaces";

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const initiate = (
  classes: ContractConstructor[],
  txRepository?: TransactionRepositoryInterface,
) => {
  const classInstances: Set<Contract> = new Set<Contract>();

  classes.forEach((ContractClass) => {
    const instance = new ContractClass(txRepository);
    instance.init();
    classInstances.add(instance);
  });

  const blockIterator = new BlockIterator(classInstances);
  blockIterator.fetchEvents();
};
