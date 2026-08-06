export interface TankPosterStat {
  label: string;
  value: string;
}

export interface TankPosterArmorLegend {
  /** Formatted "Nmm" label for this tank's thickest armor plate. */
  maxLabel: string;
  /** Formatted "Nmm" label for this tank's thinnest armor plate. */
  minLabel: string;
  /** Color the thickest plate is actually rendered in - keeps the legend's gradient matching the tank's own colors. */
  maxColor: string;
  minColor: string;
}

export interface TankPosterProps {
  name: string;
  tierNumeral: string;
  byline: string;
  backgroundImage: string;
  stats: TankPosterStat[];
  /** Tree-type accent (see treeTypeColors.ts): applied to the name and tier box, matching tankopedia's name coloring. */
  accentColor: string;
  armorLegend?: TankPosterArmorLegend;
}

const WHITE = "#f2f1ed";
const DIM = "#98978f";
const BLACK = "#08090a";

/**
 * Monochrome, satori-renderable poster layout for tank opengraph images,
 * modeled on minimalist film poster conventions: byline + title top-left,
 * tier "rating box" top-right, full-bleed art behind a legibility gradient,
 * key stats along the bottom in place of a cast list. Every element needs
 * an explicit `display: "flex"` (satori requirement) and only a flexbox
 * subset of CSS is supported: https://github.com/vercel/satori#documentation
 */
export function TankPoster({
  name,
  tierNumeral,
  byline,
  backgroundImage,
  stats,
  accentColor,
  armorLegend,
}: TankPosterProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: BLACK,
        fontFamily: "Inter",
      }}
    >
      <img
        src={backgroundImage}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: 0.95,
        }}
      />

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(to bottom, ${BLACK} 0%, rgba(8,9,10,0.15) 30%, rgba(8,9,10,0.3) 65%, ${BLACK} 100%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          position: "relative",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "48px 56px 0 56px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 22,
              color: DIM,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {byline}
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: accentColor,
              letterSpacing: -1,
              lineHeight: 1.05,
              maxWidth: 820,
            }}
          >
            {name}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${accentColor}`,
            color: accentColor,
            fontSize: 32,
            fontWeight: 700,
            padding: "8px 20px",
          }}
        >
          {tierNumeral}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }} />

      {armorLegend && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "absolute",
            right: 48,
            top: 180,
            height: 320,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: WHITE }}>
            {armorLegend.maxLabel}
          </span>

          <div
            style={{
              display: "flex",
              width: 16,
              flex: 1,
              marginTop: 10,
              marginBottom: 10,
              borderRadius: 8,
              backgroundImage: `linear-gradient(to bottom, ${armorLegend.maxColor}, ${armorLegend.minColor})`,
            }}
          />

          <span style={{ fontSize: 20, fontWeight: 700, color: WHITE }}>
            {armorLegend.minLabel}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          position: "relative",
          justifyContent: "space-between",
          padding: "0 56px 44px 56px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: WHITE }}>
              {stat.value}
            </span>
            <span
              style={{
                fontSize: 15,
                color: DIM,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
