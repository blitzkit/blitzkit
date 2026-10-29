import { alias, isExplosive } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { times } from "lodash-es";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { clamp, degToRad, radToDeg } from "three/src/math/MathUtils.js";
import type { ToyProps } from "../../config/toys";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useStrings } from "../../hooks/useStrings";
import type { ComputedCharacteristics } from "../../types/characteristics";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Code } from "../Code";
import { SegmentedControl } from "../SegmentedControl";
import { ShellBorder } from "../Tankopedia/CharacteristicsSection/components/Characteristics/components/ReloadVisualizer/components/ShellBorder";
import styles from "./index.module.css";

export function RicochetToy({ characteristics }: ToyProps) {
  const strings = useStrings();
  const shell = useDuel("protagonist", DuelModule.Shell);
  const container = useRef<HTMLDivElement>(null);
  const normalizationValue = characteristics.get("normalization");
  const ricochetValue = characteristics.get("ricochet");
  const normalization = degToRad(
    typeof normalizationValue === "number" ? normalizationValue : 0,
  );
  const ricochet = degToRad(
    typeof ricochetValue === "number" ? ricochetValue : 90,
  );
  const explodes = isExplosive(shell.type);
  const [rawAngle, setAngle] = useState(degToRad(-25));
  const angle = explodes ? degToRad(-70) : rawAngle;
  const doesRicochet = Math.abs(angle) >= ricochet;
  const effectiveAngle = doesRicochet
    ? -angle + Math.PI
    : Math.sign(angle) * Math.max(0, Math.abs(angle) - normalization);
  const armorPercentage = Math.min(999, 100 / Math.cos(effectiveAngle));

  function updateAngle(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!container.current || explodes) return;

    const rect = container.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 3;
    const y = event.clientY - rect.top - rect.height / 2;

    setAngle(clamp(Math.atan2(-y, x), -Math.PI / 2, Math.PI / 2));
  }

  return (
    <div
      ref={container}
      className={styles.visualizer}
      onPointerMove={updateAngle}
    >
      <div className={styles.armor}>
        <div className={styles.texture} />
      </div>

      <div
        className={styles.zones}
        style={
          {
            "--normalization-angle": `${normalization}rad`,
            "--ricochet-angle": `${ricochet}rad`,
          } as CSSProperties
        }
      />

      <div
        className={styles["shell-path"]}
        style={
          {
            "--rotation-angle": `${-Math.PI / 2 - angle}rad`,
          } as CSSProperties
        }
      >
        <div className={styles.extension} />
        <div className={styles.line} />
        <img
          className={styles.shell}
          src={alias("api", `/icons/shells/${shell.icon}.webp`)}
        />
      </div>

      <div
        className={styles["effective-path"]}
        style={
          {
            "--rotation-angle": `${-Math.PI / 2 - effectiveAngle}rad`,
          } as CSSProperties
        }
      >
        <div className={styles.line} />
      </div>

      <CornerStat
        label={strings.tanks.toys.ricochet.angle}
        value={literals(strings.common.units.deg, {
          value: radToDeg(Math.abs(angle)).toFixed(0),
        })}
        position={CornerStatPosition.TopLeft}
      />
      <CornerStat
        label={strings.tanks.toys.ricochet.normalization}
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.deg, {
                value: radToDeg(
                  Math.min(normalization, Math.abs(angle)),
                ).toFixed(0),
              })
        }
        position={CornerStatPosition.TopRight}
      />
      <CornerStat
        label={strings.tanks.toys.ricochet.effective}
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.deg, {
                value: radToDeg(Math.abs(effectiveAngle)).toFixed(0),
              })
        }
        position={CornerStatPosition.BottomLeft}
      />
      <CornerStat
        label={strings.tanks.toys.ricochet.armor}
        value={
          doesRicochet
            ? "-"
            : literals(strings.common.units.percentage, {
                value: armorPercentage.toFixed(0),
              })
        }
        position={CornerStatPosition.BottomRight}
      />

      {explodes && (
        <div className={styles["explosive-overlay"]}>
          {strings.tanks.toys.ricochet.no_ricochet}
        </div>
      )}
    </div>
  );
}

enum CornerStatPosition {
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

interface CornerStatProps {
  label: string;
  value: string;
  position: CornerStatPosition;
}

function CornerStat({ label, value, position }: CornerStatProps) {
  return (
    <div className={styles["corner-stat"]} data-position={position}>
      <span>{label}</span>
      <Code className={styles.value} size="minor">
        {value}
      </Code>
    </div>
  );
}

const terrains = ["hard", "medium", "soft"] as const;
type Terrain = (typeof terrains)[number];

interface TraverseToyProps {
  characteristics: ComputedCharacteristics;
}

export function TraverseToy({ characteristics }: TraverseToyProps) {
  const hull = useRef<HTMLDivElement>(null);
  const turret = useRef<HTMLImageElement>(null);

  const [terrain, setTerrain] = useState<Terrain>("hard");
  const [rotateHull, setRotateHull] = useState(true);
  const [rotateTurret, setRotateTurret] = useState(true);

  const turretAngle = useRef(0);
  const hullAngle = useRef(0);

  const strings = useStrings();

  const hullSpeed = characteristics.get(
    `hull_traverse_speed_${terrain}`,
  ) as number;
  const turretTraverseSpeed = characteristics.get(
    "turret_traverse_speed",
  ) as number;

  const turretSpeed = rotateTurret ? turretTraverseSpeed : 0;
  const hullSpeedEffective = rotateHull ? hullSpeed : 0;

  const isTurretless =
    characteristics.has("azimuth_left") || characteristics.has("azimuth_right");

  useEffect(() => {
    let cancel = false;
    const turretSpeedRad = (turretSpeed * Math.PI) / 180;
    const hullSpeedRad = (hullSpeedEffective * Math.PI) / 180;
    let lastT = Date.now() / 1000;

    function frame() {
      const t = Date.now() / 1000;
      const dt = t - lastT;
      lastT = t;

      if (turret.current) {
        turretAngle.current =
          (turretAngle.current + turretSpeedRad * dt) % (2 * Math.PI);
        turret.current.style.transform = `translate(-50%, -50%) rotate(${-turretAngle.current}rad)`;
      }

      if (hull.current) {
        hullAngle.current =
          (hullAngle.current + hullSpeedRad * dt) % (2 * Math.PI);
        hull.current.style.transform = `translate(-50%, -50%) rotate(${-hullAngle.current}rad)`;
      }

      if (!cancel) requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancel = true;
    };
  }, [hullSpeedEffective, turretSpeed]);

  const terrainOptions = terrains.map((terrain) => ({
    value: terrain,
    label:
      strings.tanks.characteristics.items[`hull_traverse_speed_${terrain}`],
  }));

  return (
    <div className={styles.traverse}>
      <div ref={hull} className={styles.hull} data-turretless={isTurretless}>
        <img
          draggable="false"
          className={styles.image}
          src={`/media/toys/hull${isTurretless ? "-only" : ""}.png`}
        />

        {!isTurretless && (
          <img
            draggable="false"
            ref={turret}
            className={styles.turret}
            src="/media/toys/turret.png"
          />
        )}
      </div>

      <div className={styles.toggles}>
        {!isTurretless && (
          <>
            <Checkbox checked={rotateHull} onCheckedChange={setRotateHull}>
              {strings.tanks.toys.traverse.hull}
            </Checkbox>
            <Checkbox checked={rotateTurret} onCheckedChange={setRotateTurret}>
              {strings.tanks.toys.traverse.turret}
            </Checkbox>
          </>
        )}
      </div>

      <div className={styles.terrain}>
        <SegmentedControl
          options={terrainOptions}
          value={terrain}
          onValueChange={(value) => {
            const nextTerrain = terrains.find((terrain) => terrain === value);
            if (nextTerrain) setTerrain(nextTerrain);
          }}
          variant="underline"
        />
      </div>

      <div className={styles.effective}>
        <span>{strings.tanks.toys.traverse.effective}</span>
        <Code size="minor">
          {literals(strings.units.deg_s, {
            value: (turretSpeed + hullSpeedEffective).toFixed(1),
          })}
        </Code>
      </div>
    </div>
  );
}

const RELOAD_PRECISION = 1;

interface ReloadData {
  reloads: number[];
  shells: number;
  intraClip: number;
  burstShells: number;
  burstInterShell?: number;
}

export function ReloadToy({ characteristics }: ToyProps) {
  const gun = useDuel("protagonist", DuelModule.Gun);
  const strings = useStrings();

  const reloadData = useMemo<ReloadData>(() => {
    const reloadCoefficient = characteristics.get(
      "_reload_coefficient",
    ) as number;
    const intraClip =
      gun.gun_type!.$case === "regular"
        ? 0
        : (characteristics.get("intra_clip") as number);

    let reloads: number[];
    let shells: number;

    switch (gun.gun_type!.$case) {
      case "regular":
        reloads = [characteristics.get("reload") as number];
        shells = 1;
        break;

      case "auto_loader":
        reloads = [characteristics.get("reload") as number];
        shells = gun.gun_type!.value.shell_count;
        break;

      case "auto_reloader":
        reloads = gun.gun_type!.value.shell_reloads.map(
          (reload) => reload * reloadCoefficient,
        );
        shells = gun.gun_type!.value.shell_count;
        break;
    }

    return {
      reloads,
      shells,
      intraClip,
      burstShells: gun.burst?.count ?? 1,
      burstInterShell: gun.burst?.interval,
    };
  }, [characteristics, gun]);

  const glow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const remainingTime = useRef<HTMLSpanElement>(null);
  const totalTime = useRef<HTMLSpanElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const shellBars = useRef<Array<HTMLDivElement | null>>([]);
  const state = useRef(0);

  const shoot = useCallback(() => {
    for (const element of [flash.current, ring.current, glow.current]) {
      if (!element) continue;

      element.dataset.shot = "true";

      void element.offsetWidth;
      delete element.dataset.shot;
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    let lastTime = performance.now() / 1000;
    let lastState = state.current;

    state.current = 0;

    function frame() {
      const reloadThreshold = reloadData.reloads.length;
      const now = performance.now() / 1000;
      const deltaTime = now - lastTime;

      let reload = 0;
      let shells: number[];
      let interval = 0;

      if (state.current < reloadThreshold) {
        const currentReload = reloadData.reloads[Math.floor(state.current)];

        if (currentReload === undefined) {
          throw new Error("Missing reload duration for current reload stage");
        }

        interval = currentReload;
        state.current = Math.min(
          reloadThreshold,
          state.current + deltaTime / interval,
        );
        reload = state.current % 1;
        shells = Array(reloadData.shells).fill(reload);

        if (reloadThreshold > 1) {
          shells = shells.map((_, index) =>
            Math.max(0, state.current - reloadData.shells + index + 1),
          );
        }

        if (state.current >= reloadThreshold) shoot();
      } else if (state.current < reloadData.shells + reloadThreshold - 1) {
        if (
          reloadData.burstShells === 1 ||
          Math.floor(state.current) % reloadData.burstShells === 0
        ) {
          interval = reloadData.intraClip;
        } else {
          if (reloadData.burstInterShell === undefined) {
            throw new Error("Missing burst interval for firing sequence");
          }

          interval = reloadData.burstInterShell;
        }

        state.current = Math.min(
          reloadData.shells + reloadThreshold,
          state.current + deltaTime / interval,
        );
        reload = state.current % 1;

        shells =
          reloadThreshold > 1
            ? times(reloadData.shells, (index) =>
                Math.max(
                  0,
                  Math.floor(index + 1 + reloadThreshold - state.current),
                ),
              )
            : times(reloadData.shells, (index) =>
                Number(index > state.current - 1),
              );

        if (lastState % 1 > state.current % 1) shoot();
      } else {
        state.current = 0;
        shells = Array(reloadData.shells).fill(0);
      }

      if (interval > 0 && totalTime.current) {
        totalTime.current.textContent = interval.toFixed(RELOAD_PRECISION);
      }

      if (interval > 0 && remainingTime.current) {
        remainingTime.current.textContent = ((1 - reload) * interval).toFixed(
          RELOAD_PRECISION,
        );
      }

      for (const [index, bar] of shellBars.current.entries()) {
        if (bar) bar.style.width = `${(shells[index] ?? 0) * 100}%`;
      }

      if (ring.current && glow.current && core.current) {
        const angle = reload * 2 * Math.PI;

        ring.current.style.background = `conic-gradient(var(--amber-9) 0 ${angle}rad, var(--orange-7) ${angle}rad)`;
        core.current.style.background = `conic-gradient(var(--amber-6) 0 ${angle}rad, var(--orange-3) ${angle}rad)`;
        glow.current.style.background = `conic-gradient(var(--amber-9) 0 ${angle}rad, transparent ${angle}rad)`;
      }

      if (!cancel) requestAnimationFrame(frame);

      lastTime = now;
      lastState = state.current;
    }

    frame();

    return () => {
      cancel = true;
    };
  }, [reloadData, shoot]);

  return (
    <div className={styles.reload}>
      <div className={styles.backdrop} />
      <div className={styles.vignette} />

      <div className={styles.glow} ref={glow} />
      <div className={styles.ring} ref={ring}>
        <div className={styles.core}>
          <div className={styles.target} />
          <div className={styles.fill} ref={core} />
        </div>
      </div>

      <img
        className={styles.caret}
        src="/assets/images/tankopedia/visualizers/reload/caret.png"
      />

      <Code
        variant="ghost"
        className={styles["remaining-time"]}
        ref={remainingTime}
      >
        {(0).toFixed(RELOAD_PRECISION)}
      </Code>
      <Code variant="ghost" className={styles["total-time"]} ref={totalTime}>
        {(0).toFixed(RELOAD_PRECISION)}
      </Code>

      {reloadData.shells > 1 && (
        <div className={styles.shells} aria-hidden="true">
          {Array.from({ length: reloadData.shells }, (_, index) => (
            <div
              className={styles["shell-track"]}
              key={index}
              style={{
                transform: `rotate(${135 - 7 * (index - (reloadData.shells - 1) / 2)}deg)`,
              }}
            >
              <div className={styles.shell}>
                <ShellBorder className={styles.border} />
                <div className={styles.mask}>
                  <div
                    className={styles["shell-fill"]}
                    ref={(element) => {
                      shellBars.current[index] = element;
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.flash} ref={flash} />

      <Button
        className={styles.skip}
        size="minor"
        variant="outline"
        color="gray"
        highContrast
        aria-label={strings.tanks.toys.reload.skip}
        onClick={() => {
          state.current = Math.floor(state.current + 1);
        }}
      >
        {strings.tanks.toys.reload.skip}
        <DoubleArrowRightIcon />
      </Button>
    </div>
  );
}
