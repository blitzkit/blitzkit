enum CreditType {
  Primary = "primary",
  Active = "active",
  Past = "past",
}

interface CreditGroup {
  type: CreditType;
  people: CreditPeople[];
}

interface CreditPeople {
  name: string;
  description: string;
  url?: string;
  image: string;
}

export const credits: CreditGroup[] = [
  {
    type: CreditType.Primary,
    people: [
      {
        name: "TrèsAbhi",
        description: "Founder and lead developer",
        url: "https://abhi-deep.com/",
        image: "https://github.com/tresabhi.png",
      },
    ],
  },
  {
    type: CreditType.Active,
    people: [
      {
        name: "HitJack",
        description: "Developer",
        url: "https://github.com/Hitjack007",
        image: "https://github.com/Hitjack007.png",
      },
      {
        name: "aeson000",
        description: "Advisor",
        url: "https://discord.gg/WHdER7ZPAD",
        image: "/media/users/aeson000.png",
      },
      {
        name: "GonnaHetzMe",
        description: "Developer and advisor",
        url: "https://github.com/karelpak1",
        image: "https://github.com/karelpak1.png",
      },
    ],
  },
  {
    type: CreditType.Past,
    people: [
      {
        name: "Prince_NA",
        description: "Former advisor",
        image: "/media/users/prince-na.png",
      },
      {
        name: "S0AP",
        description: "Former advisor and advertiser",
        url: "https://discord.gg/3KfH93um3Y",
        image: "/media/users/s0ap.png",
      },
    ],
  },
];
