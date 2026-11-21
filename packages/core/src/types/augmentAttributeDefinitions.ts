// What an augment attribute shows, by attribute name
export interface AugmentAttributeDefinition {
  icon: string;
  title: string;
}

export type AugmentAttributeDefinitions = Map<
  string,
  AugmentAttributeDefinition
>;
