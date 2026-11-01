export type CamouflagesYaml = Record<
  string,
  {
    userString?: string;
    shortUserString?: string;
    preset?: string;
    customEntities?: Record<string, { item: string }>;
    // nation -> tank
    override?: Record<
      string,
      { override?: Record<string, { preset?: string }> }
    >;
  }
>;

// some unique camos only set the preset for their one tank
export function camouflagePreset(
  camouflage: CamouflagesYaml[string],
  nation: string,
  tankKey: string,
) {
  return (
    camouflage.preset ??
    camouflage.override?.[nation]?.override?.[tankKey]?.preset
  );
}
