import React from "react";
import { COLORS, prog } from "../../../kit";
import { copy } from "../copy";
import { MEASURED } from "../data";
import { RACE } from "../timeline";
import { Terminal } from "./Terminal";

/** The race: the same command with normal and with lazy imports, slowed 4x. `t` is hook time
 * (the loop end renders it at t = 0, so the last frame matches the first). */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const typed = 1; // the command is already typed on frame 0 (loop-safe)
  const loadN = prog(t, RACE.start, RACE.normalEnd, (x) => x);
  const loadL = prog(t, RACE.start, RACE.lazyEnd, (x) => x);
  return (
    <>
      <Terminal
        t={t}
        x={60}
        y={505}
        w={880}
        h={398}
        title={copy.hook.normal}
        accent={COLORS.red}
        command={copy.hook.command}
        typed={typed}
        load={loadN}
        total={MEASURED.normal.modules}
        ms={MEASURED.normal.ms}
        mb={MEASURED.normal.mb}
        done={t >= RACE.normalEnd ? RACE.normalEnd : 0}
        badge="import pandas, ..."
      />
      <Terminal
        t={t}
        x={60}
        y={925}
        w={880}
        h={398}
        title={copy.hook.lazy}
        accent={COLORS.green}
        command={copy.hook.command}
        typed={typed}
        load={loadL}
        total={MEASURED.lazy.modules}
        ms={MEASURED.lazy.ms}
        mb={MEASURED.lazy.mb}
        done={t >= RACE.lazyEnd ? RACE.lazyEnd : 0}
        badge="lazy import pandas, ..."
      />
    </>
  );
};
