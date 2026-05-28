import { LocationService } from "@/services/locationService";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { locationKeys } from "../locationKeys";

export default function useLgas(stateCode: string) {
  return useQuery({
    queryKey: locationKeys.getLgas(stateCode),
    queryFn: () => LocationService.getLgas(stateCode),
    enabled: !!stateCode,
  });
}
