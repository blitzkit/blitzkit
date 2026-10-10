enum CreditType {
  Primary = "primary",
}

interface CreditGroup {
  type: CreditType;
  people: CreditPeople[];
}

interface CreditPeople {
  name: string;
  url: string;
  image: string;
}

export const credits: CreditGroup[] = [
  {
    type: CreditType.Primary,
    people: [
      {
        name: "TrèsAbhi",
        url: "https://abhi-deep.com/",
        image: "https://github.com/tresabhi.png",
      },
    ],
  },
];
