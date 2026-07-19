import { NotificationService } from "@/services/notificationService";
import { RegisterDeviceTokenDto } from "@/types/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { notificationKeys } from "../notificationKey";

export default function useRegisterDeviceToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegisterDeviceTokenDto) =>
      NotificationService.registerDeviceToken(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
  });
}
