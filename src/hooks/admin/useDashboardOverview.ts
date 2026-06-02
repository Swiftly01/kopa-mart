import { DashboardService } from "@/services/dashboardService";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";

export interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  verifiedSellers: number;
  pendingApplications: number;
  activeNow: number;
}

export interface ActiveUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  lastLoginAt: string;
}

export interface RecentActivityItem {
  id: string;
  type:
    | "LISTING_CREATED"
    | "LISTING_DELETED"
    | "SELLER_APPROVED"
    | "USER_REGISTERED"
    | string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  description: string;
  metadata: Record<string, string>;
  createdAt: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  currentlyActive: ActiveUser[];
  recentActivity: RecentActivityItem[];
}

interface UseDashboardOverviewReturn {
  data: DashboardOverview | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export default function useDashboardOverview(): UseDashboardOverviewReturn {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchOverview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await DashboardService.getDashboardOverview();
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to load dashboard data",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      cancelled = true;
    };
  }, [trigger]);

  const refetch = () => setTrigger((t) => t + 1);

  return { data, isLoading, error, refetch };
}
