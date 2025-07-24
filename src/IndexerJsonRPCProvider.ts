import { JsonRpcProvider } from "ethers";
import ConfigFacade from "./ConfigFacade";

class IndexerJsonRPCProvider {
  public static provider: JsonRpcProvider;

  public static getInstance() {
    if (!IndexerJsonRPCProvider.provider)
      IndexerJsonRPCProvider.provider = new JsonRpcProvider(
        ConfigFacade.getConfig()?.rpcUrl,
      );
    return IndexerJsonRPCProvider.provider;
  }
}

export default IndexerJsonRPCProvider;
