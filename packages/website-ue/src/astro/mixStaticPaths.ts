import type {
  GetStaticPathsItem,
  GetStaticPathsOptions,
  GetStaticPathsResult,
} from "astro";

type Promisable<T> = T | Promise<T>;

export function mixStaticPaths<
  TypeA extends GetStaticPathsItem,
  TypeB extends GetStaticPathsItem
>(
  a: (options: GetStaticPathsOptions) => Promisable<TypeA[]>,
  b: (options: GetStaticPathsOptions) => Promisable<TypeB[]>
) {
  return async function (options: GetStaticPathsOptions) {
    const pathsA = await a(options);
    const pathsB = await b(options);
    const paths: GetStaticPathsResult = [];

    for (const pathA of pathsA) {
      for (const pathB of pathsB) {
        paths.push({
          params: { ...pathA.params, ...pathB.params },
          props: { ...pathA.props, ...pathB.props },
        });
      }
    }

    return paths as (TypeA & TypeB)[];
  };
}
