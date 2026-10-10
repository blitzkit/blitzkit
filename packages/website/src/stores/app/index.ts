import { Varuna } from "varuna";

export interface WargamingLogin {
  token: string;
  id: number;
  expires: number;
}

export interface App {
  developerMode: boolean;
  autoLoadModels: boolean;
  policiesAgreementIndex: number;
  logins: {
    wargaming?: WargamingLogin;
  };
}

export const App = new Varuna<App>(
  {
    developerMode: false,
    autoLoadModels: true,
    policiesAgreementIndex: -1,
    logins: {},
  },
  "app-2"
);
