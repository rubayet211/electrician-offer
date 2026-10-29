import { clientConfigSchema } from "@/types/client-config";
import demo from "@/clients/demo/client.config";
export { default as clientConfig } from "@/clients/demo/client.config";
export const parsedClientConfig = clientConfigSchema.parse(demo);
