export interface TechTreeLayoutYamlModule {
  position: [number, number];
}

export interface TechTreeLayoutYaml {
  modules?: Record<string, TechTreeLayoutYamlModule>;
}
