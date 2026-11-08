for dir in packages/*/; do
  (cd "$dir" && bun --bun run lint)
done