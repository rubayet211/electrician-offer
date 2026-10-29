export function databaseSsl(
  url: string,
  ca?: string,
  nodeEnv?: string,
): false | { rejectUnauthorized: true; ca?: string };
