import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
const input = createInterface({ input: process.stdin, output: process.stderr });
const password = await input.question("Admin password: ");
input.close();
if (!password) throw new Error("Password required");
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(`scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`);
