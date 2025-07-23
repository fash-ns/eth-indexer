import { JsonRpcProvider } from "ethers";

class JsonRPCProvider {
  public static provider: JsonRpcProvider;

  public static getInstance() {
    if (!process.env.RPC_PROVIDER_URL) {
      throw new Error(
        "RPC_PROVIDER_URL is not set in the environment variables.",
      );
    }
    if (!JsonRPCProvider.provider)
      JsonRPCProvider.provider = new JsonRpcProvider(
        process.env.RPC_PROVIDER_URL,
      );
    return JsonRPCProvider.provider;
  }
}

export default JsonRPCProvider;
