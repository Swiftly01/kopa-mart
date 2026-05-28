export const locationKeys = {
  all: ["location"] as const,
  getStates: () => [...locationKeys.all, "states"] as const,
  getLgas: (stateCode: string) => [...locationKeys.all, "lgas", stateCode] as const,
};
