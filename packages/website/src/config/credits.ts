enum CreditType {
  Primary = "primary",
  Active = "active",
  Moderators = "moderators",
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
        description: "Developer on website",
        url: "https://github.com/Hitjack007",
        image: "https://github.com/Hitjack007.png",
      },
      {
        name: "aeson000",
        description: "Advisor on game and website",
        url: "https://discord.gg/WHdER7ZPAD",
        image: "/media/users/aeson000.png",
      },
      {
        name: "GonnaHetzMe",
        description: "Developer and advisor on back end",
        url: "https://github.com/karelpak1",
        image: "https://github.com/karelpak1.png",
      },
    ],
  },
  {
    type: CreditType.Moderators,
    people: [
      {
        name: "ChickenMan7777",
        description: "Moderator and former advisor on game mechanics",
        url: "https://discord.gg/rEsUbXCqD9",
        image: "/media/users/chickenman7777.webp",
      },
    ],
  },
  {
    type: CreditType.Past,
    people: [
      {
        name: "Pyogenics",
        description: "Former advisor on back end",
        url: "https://github.com/Pyogenics",
        image: "https://github.com/Pyogenics.png",
      },
      {
        name: "Prince_NA",
        description: "Former advisor on bot and website",
        image: "/media/users/prince-na.webp",
      },
      {
        name: "Vovko",
        description: "Former advisor on bot",
        url: "https://amth.one/",
        image: "https://github.com/cufee.png",
      },
      {
        name: "S0AP",
        description: "Former advisor and advertiser on bot",
        url: "https://discord.gg/3KfH93um3Y",
        image: "/media/users/s0ap.webp",
      },
      {
        name: "Minitelrose",
        description: "Former advisor on game mechanics",
        url: "https://wotinspector.com/",
        image: "/media/users/minitelrose.webp",
      },
      {
        name: "Maddox",
        description: "Game asset decompression",
        url: "https://github.com/Maddoxkkm",
        image: "https://github.com/Maddoxkkm.png",
      },
    ],
  },
];
