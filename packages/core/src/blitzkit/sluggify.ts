import { slugify } from "transliteration";

const nonAlphanumericRegex = /[^a-z0-9]/g;
const multipleDashesRegex = /--+/g;
const trailingDashRegex = /-$/g;
const leadingDashRegex = /^-/g;

export function sluggify(value: string) {
  let slug = slugify(value);
  slug = slug.replaceAll(nonAlphanumericRegex, "-");
  slug = slug.replaceAll(multipleDashesRegex, "-");
  slug = slug.replaceAll(trailingDashRegex, "");
  slug = slug.replaceAll(leadingDashRegex, "");

  return slug;
}
