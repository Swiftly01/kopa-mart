export interface State {
  id: string;
  name: string;
  code: string;
}

export interface StatesResponse {
  success: boolean;
  message: string;
  data: State[];
}

export interface Lga {
  id: string;
  name: string;
  stateCode: string;
}

export interface LgasResponse {
  success: boolean;
  message: string;
  data: {
    state: {
      code: string;
      name: string;
    };
    lgas: Lga[];
  };
}