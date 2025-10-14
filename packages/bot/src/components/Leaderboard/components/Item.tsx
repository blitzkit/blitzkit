import { type ComponentProps } from "react";
import { theme } from "../../../stitches.config";

interface ItemProps extends ComponentProps<"div"> {
  position: number;
  deltaPosition?: number;
  score?: number;
  deltaScore?: number;
  nickname: string;
  clan?: string;
  highlight?: boolean;
}

export function Item({
  position,
  deltaPosition,
  score,
  deltaScore,
  nickname,
  clan,
  highlight,
  ...props
}: ItemProps) {
  return (
    <div
      {...props}
      style={{
        cursor: "pointer",
        display: "flex",
        padding: 8,
        backgroundColor: highlight
          ? theme.colors.componentInteractive_blue
          : theme.colors.componentInteractive,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          color: highlight
            ? theme.colors.textLowContrast_blue
            : theme.colors.textLowContrast,
          fontSize: 16,
        }}
      >
        {position.toLocaleString()}.
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span
          style={{
            color: highlight
              ? theme.colors.textHighContrast_blue
              : theme.colors.textHighContrast,
            fontSize: 16,
          }}
        >
          {nickname}
        </span>
        {clan && (
          <span
            style={{
              color: highlight
                ? theme.colors.textLowContrast_blue
                : theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            [{clan}]
          </span>
        )}
      </div>

      {deltaPosition !== undefined && deltaPosition !== 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <img
            alt={deltaPosition > 0 ? "Increase" : "Decrease"}
            style={{
              width: 8,
              height: 8,
            }}
            src={
              deltaPosition > 0
                ? "https://i.imgur.com/qbjiXa1.png"
                : "https://i.imgur.com/3uyNhun.png"
            }
          />
          <span
            style={{
              color: highlight
                ? theme.colors.textLowContrast_blue
                : theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            {Math.abs(deltaPosition).toLocaleString()}
          </span>
        </div>
      )}

      {/* TODO: lol remove this spacer div for a better solution */}
      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          width: 96,
          justifyContent: "flex-end",
        }}
      >
        {deltaScore !== 0 && deltaScore !== undefined && (
          <span
            style={{
              color: highlight
                ? theme.colors.textLowContrast_blue
                : theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            {Math.abs(deltaScore).toLocaleString()}
          </span>
        )}
        {deltaScore !== 0 && deltaScore !== undefined && (
          <img
            alt={deltaScore > 0 ? "Increase" : "Decrease"}
            style={{
              width: 8,
              height: 8,
            }}
            src={
              deltaScore > 0
                ? "https://i.imgur.com/qbjiXa1.png"
                : "https://i.imgur.com/3uyNhun.png"
            }
          />
        )}

        {score !== undefined && (
          <span
            style={{
              color: highlight
                ? theme.colors.textHighContrast_blue
                : theme.colors.textHighContrast,
              fontSize: 16,
            }}
          >
            {score.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
