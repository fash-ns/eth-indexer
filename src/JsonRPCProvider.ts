import { JsonRpcProvider } from "ethers";
import ConfigFacade from "./ConfigFacade";

class JsonRPCProvider {
  public static provider: JsonRpcProvider;

  public static getInstance() {
    if (!JsonRPCProvider.provider)
      JsonRPCProvider.provider = new JsonRpcProvider(
        ConfigFacade.getConfig()?.rpcUrl,
      );
    return JsonRPCProvider.provider;
  }
}

export default JsonRPCProvider;
