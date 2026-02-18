import { usersDatabase } from "../db/users";
import { client } from "../discord/client";

const EXIT_EVENTS = ["SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"];

let cleaningUp = false;

async function cleanup(signal: string) {
  if (cleaningUp) return;
  cleaningUp = true;

  console.log(`Cleaning up... (${signal})`);

  try {
    await Promise.all([usersDatabase.$disconnect(), client.destroy()]);
  } catch (err) {
    console.error("Cleanup error:", err);
  }

  console.log("Gracefully exiting...");

  process.exit(0);
}

export function registerProcesses() {
  process.on("uncaughtException", (err) => {
    console.error("uncaughtException:", err);
  });

  process.on("unhandledRejection", (err) => {
    console.error("unhandledRejection:", err);
  });

  client.on("error", console.error);

  EXIT_EVENTS.forEach((event) => process.on(event, () => cleanup(event)));
}
