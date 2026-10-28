export type CamouflagesYaml = Record<
  string,
  {
    userString?: string;
    shortUserString?: string;
    preset?: string;
    customEntities?: Record<string, { item: string }>;
  }
>;
