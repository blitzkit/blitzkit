bun install

cd packages/scripts
bun run build-protos
bun run build-proxy-client
bun run build-catalog-item-accessor

cd ../..
bun build-game
