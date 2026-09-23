export type CaseType<T> = T extends {
  gun_type?: { $case: infer U; value: any };
}
  ? U
  : never;
