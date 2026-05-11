// Source - https://stackoverflow.com/a/9083076
// Posted by Rene Pot, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-11, License - CC BY-SA 4.0

const keys = [
  "",
  "C",
  "CC",
  "CCC",
  "CD",
  "D",
  "DC",
  "DCC",
  "DCCC",
  "CM",
  "",
  "X",
  "XX",
  "XXX",
  "XL",
  "L",
  "LX",
  "LXX",
  "LXXX",
  "XC",
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
];

export function romanize(number: number) {
  let digits = String(+number).split("");
  let roman = "";
  let i = 3;

  while (i--) {
    roman = (keys[+digits.pop()! + i * 10] || "") + roman;
  }

  return Array(+digits.join("") + 1).join("M") + roman;
}
