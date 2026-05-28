import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { LgasResponse, StatesResponse } from "@/types/location";

export class LocationService {
  static async getStates(): Promise<StatesResponse> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/location`);

    //console.log(response);
    return response.data;
  }

  static async getLgas(stateCode: string): Promise<LgasResponse> {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/location/${stateCode}/lgas`,
    );

    //console.log(response);
    return response.data;
  }
}
