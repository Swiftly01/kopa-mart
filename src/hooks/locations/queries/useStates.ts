import { LocationService } from "@/services/locationService";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { locationKeys } from "../locationKeys";

export default function useStates() {
  return useQuery({
    queryKey: locationKeys.getStates(),
    queryFn: () => LocationService.getStates(),
  });
}
