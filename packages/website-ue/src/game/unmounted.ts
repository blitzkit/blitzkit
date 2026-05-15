export const clientUnmounted = !("PUBLIC_WOTB_CLIENT" in import.meta.env);

if (clientUnmounted) {
  console.warn("Running in client denied mode...");
}
