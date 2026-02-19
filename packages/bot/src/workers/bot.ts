import { assertSecret } from "@blitzkit/core";
import { registerProcesses } from "../core/blitzkit/processes";
import { client } from "../core/discord/client";

console.log(`🟡 Launching bot ${client.shard?.ids[0]}`);

registerProcesses();

console.log(`post register processes on shard ${client.shard?.ids[0]}`);

client.login(assertSecret(import.meta.env.DISCORD_TOKEN));

console.log(`post client login on shard ${client.shard?.ids[0]}`);
