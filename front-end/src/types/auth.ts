import { PatientData } from "./patient";

export interface UserJwtData {
  sub: string;
  cpf: string;
  email: string;
  type: string;
}

export interface UserState {
  auth: UserJwtData | null;
  profile: PatientData | null;
}

export interface User {
  id: string;
  cpf: string;
  email: string;
  senha: string;
  type?: string;
}

export type Admin = User;
