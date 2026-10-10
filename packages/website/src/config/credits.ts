enum CreditType {
  Primary = "primary",
  Active = "active",
}

interface CreditGroup {
  type: CreditType;
  people: CreditPeople[];
}

interface CreditPeople {
  name: string;
  description: string;
  url: string;
  image: string;
}

export const credits: CreditGroup[] = [
  {
    type: CreditType.Primary,
    people: [
      {
        name: "TrèsAbhi",
        description: "Founder and lead developer of BlitzKit",
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
        description: "Active developer of BlitzKit features",
        url: "https://github.com/Hitjack007",
        image: "https://github.com/Hitjack007.png",
      },
      {
        name: "GonnaHetzMe",
        description: "Developer & advisor on BlitzKit and World of Tanks Blitz",
        url: "https://github.com/karelpak1",
        image: "https://github.com/karelpak1.png",
      },
    ],
  },
];
