import { intervalToDuration } from "date-fns";
import { useMask } from "mask-hooks";
import ms from "ms";
import {
  ButtonHTMLAttributes,
  ChangeEvent,
  HTMLAttributes,
  useMemo,
  useState,
} from "react";
import { useTimer } from "use-timer";
import { PauseIcon, PlayIcon, ResetIcon } from "./Icons";

function App() {
  return (
    <div className="w-full h-full -grid -grid-cols-[15%_1fr_15%] gap-0.5 justify-center items-center p-2">
      <Timer />
    </div>
  );
}

function Timer() {
  const [editing, setEditing] = useState(false);
  const mask = useMask({
    masks: ["[0-9][0-9]:[0-9][0-9]"],
  });
  const [timerValue, setTimerValue] = useState(mask("1000"));

  const timer = useMemo(() => {
    const [minutes, seconds] = timerValue.split(":").map((v) =>
      Number(v ?? 0)
        .toString()
        .padStart(2, "0")
    );

    return ms(`${minutes}m`) + ms(`${seconds}s`);
  }, [timerValue]);

  return (
    <TimerInternal
      key={timer}
      editing={editing}
      setEditing={setEditing}
      timer={timer}
      timerValue={timerValue}
      setTimerValue={(v) => setTimerValue(mask(v))}
    />
  );
}

function TimerInternal({
  editing,
  setEditing,
  timer,
  timerValue,
  setTimerValue,
}: {
  editing: boolean;
  setEditing: (editing: boolean) => void;
  timer: number;
  timerValue: string;
  setTimerValue: (value: string | ((current: string) => string)) => void;
}) {
  const { time, start, pause, reset, status } = useTimer({
    step: ms("1s"),
    initialTime: timer,
    timerType: "DECREMENTAL",
  });

  const duration = intervalToDuration({
    start: -time,
    end: 0,
  });

  const minutes = (duration.minutes ?? 0).toString().padStart(2, "0");
  const seconds = (duration.seconds ?? 0).toString().padStart(2, "0");

  const timerDisplay = `${minutes}:${seconds}`;

  function updateTimer(e: ChangeEvent<HTMLInputElement>) {
    setTimerValue(e.target.value);
  }
  const El = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
    if (editing) {
      return (
        <input
          {...props}
          type="text"
          value={timerValue}
          onChange={updateTimer}
          onBlur={() => setEditing(false)}
          autoFocus
        />
      );
    }

    return <h1 {...props} children={children} />;
  };

  return (
    <div className="grid grid-rows-[30%_1fr] h-full w-full">
      <div />
      <div className="flex flex-col gap-0.5">
        <El
          onClick={() => status === "STOPPED" && setEditing(true)}
          className={cn(
            "font-sans text-8xl tracking-tighter bg-neutral-200 rounded font-black w-full text-center",
            editing
              ? "text-black"
              : Number(duration.minutes ?? 0) < 1
              ? "text-red-500"
              : Number(duration.minutes ?? 0) < 4
              ? "text-yellow-400"
              : null
          )}
        >
          {timerDisplay}
        </El>

        <div className="flex justify-center gap-1">
          {status === "RUNNING" ? (
            <TimerButton onClick={pause}>
              <PauseIcon />
            </TimerButton>
          ) : (
            <TimerButton onClick={start}>
              <PlayIcon />
            </TimerButton>
          )}

          <TimerButton onClick={reset}>
            <ResetIcon />
          </TimerButton>
        </div>
      </div>
    </div>
  );
}

function TimerButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      tabIndex={2}
      className="inline-flex items-center text-sm justify-center bg-neutral-200 h-5 aspect-square rounded-full active:bg-neutral-500"
      {...props}
    />
  );
}

function TeamScore() {
  const [name, setName] = useState("Time");
  const [score, setScore] = useState(0);

  function increase(value: number) {
    setScore((score) => score + value);
  }

  return (
    <div className="grid grid-rows-[30%_1fr] h-full w-full overflow-hidden justify-center">
      <h3
        tabIndex={1}
        className="self-end text-center text-xs uppercase font-bold text-neutral-500"
        contentEditable
        onChange={(e: ChangeEvent<HTMLHeadingElement>) =>
          setName(e.target.innerText)
        }
        dangerouslySetInnerHTML={{
          __html: name,
        }}
      />
      <div className="flex flex-col w-full gap-1 items-center ">
        <h2 className="text-4xl font-black">
          {score.toString().padStart(2, "0")}
        </h2>
        <div className="w-full flex flex-col rounded bg-neutral-200 overflow-hidden">
          <ScoreButton onClick={() => increase(1)}>+1</ScoreButton>
          <ScoreButton onClick={() => increase(2)}>+2</ScoreButton>
          <ScoreButton onClick={() => increase(3)}>+3</ScoreButton>
        </div>
        <TimerButton onClick={() => setScore(0)}>
          <ResetIcon />
        </TimerButton>
      </div>
    </div>
  );
}

function ScoreButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      tabIndex={5}
      className="py-1 px-2 font-bold active:bg-neutral-300 border-b border-b-neutral-400 last:border-none"
      {...props}
    />
  );
}

export default App;

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
