import { useQuery } from "@tanstack/react-query";
import React from "react";
import { userKeys } from "../userKey";
import { UserService } from "@/services/userService";
import { User } from "@/types/user";
import { useAuth } from "@/context/AuthContext";

interface UseUserOptions {
  enabled?: boolean;
}

export default function useUser(options?: UseUserOptions) {
  const { session } = useAuth();

  return useQuery<User>({
    queryKey: userKeys.getUser(),
    queryFn: UserService.getUser,
    enabled: options?.enabled ?? !!session?.token,
  });
}
