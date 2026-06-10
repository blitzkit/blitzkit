bun install

cd packages/scripts
bun run build:protos
bun run build:proxyclient
bun run build:catalogitemaccessor

cd ../..
bun build-game
