import type { MessageFns } from "@blitzkit/protos/src/blitzkit";

export async function fetchPB<Type>(url: string, message: MessageFns<Type>) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);
  return message.decode(array);
}
