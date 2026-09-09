"use client";

import { useMemo, useState } from "react";
import type { TestResult } from "@/lib/diagnosis";
import { Back, Choice, Primary } from "./ui";

const COLORS = [
  { key: "black", bg: "#000", color: "#fff", label: "Black screen", look: "dead pixels, black spots, display abnormalities" },
  { key: "white", bg: "#fff", color: "#142033", label: "White screen", look: "bright spots, discoloration, display damage" },
  { key: "red", bg: "#c0392b", color: "#fff", label: "Red screen", look: "pixel abnormalities, colour issues" },
  { key: "green", bg: "#1e8449", color: "#fff", label: "Green screen", look: "pixel abnormalities, colour issues" },
  { key: "blue", bg: "#1e4d8c", color: "#fff", label: "Blue screen", look: "pixel abnormalities, colour issues" },
] as const;

const COLS = 4;
const ROWS = 6;

export function ScreenStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (result: TestResult, reports: string[]) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [issues, setIssues] = useState<string[]>([]);
  const [report, setReport] = useState("");
  const current = COLORS[idx];

  if (idx < COLORS.length) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: current.bg, color: current.color || "#fff" }}>
        <p className="p-4 text-center text-sm font-semibold">
          {current.label}. Look for {current.look}. Tap the screen to inspect, then choose below.
        </p>
        <div className="flex-1" />
        <div className="flex gap-2 p-4">
          <button
            type="button"
            className="min-h-12 flex-1 rounded-full bg-white/90 px-4 py-3 font-semibold text-navy"
            onClick={() => setIdx(idx + 1)}
          >
            Looks fine
          </button>
          <button
            type="button"
            className="min-h-12 flex-1 rounded-full bg-navy px-4 py-3 font-semibold text-white"
            onClick={() => {
              setIssues((v) => [...v, current.key]);
              setIdx(idx + 1);
            }}
          >
            I see an issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted">Colour screens cannot prove hardware health on their own. Report anything you saw.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Dead pixels", "Display line", "Screen flickering", "Cracked screen"].map((item) => (
          <Choice
            key={item}
            selected={report === item}
            onClick={() => setReport(item)}
            label={item}
          />
        ))}
        <Choice selected={report === "none"} onClick={() => setReport("none")} label="No display issue" />
      </div>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary
          disabled={!report}
          onClick={() => {
            const flagged = issues.length > 0 || (report && report !== "none");
            onDone(
              {
                key: "screen",
                label: "Screen",
                outcome: flagged ? "Customer reported issue" : "Passed",
                source: flagged ? "CUSTOMER" : "TEST_PASSED",
                detail: flagged ? `${issues.join(", ")} ${report !== "none" ? report : ""}`.trim() : undefined,
              },
              flagged ? [report !== "none" ? report : "Display abnormality"] : [],
            );
          }}
        >
          Continue
        </Primary>
      </div>
    </div>
  );
}

export function TouchStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (result: TestResult) => void;
}) {
  const total = COLS * ROWS;
  const [filled, setFilled] = useState<boolean[]>(() => Array(total).fill(false));
  const [multi, setMulti] = useState(false);
  const [issue, setIssue] = useState("");
  const doneCount = useMemo(() => filled.filter(Boolean).length, [filled]);

  function mark(index: number, touches: number) {
    if (touches > 1) setMulti(true);
    setFilled((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }

  const complete = doneCount === total || issue;

  return (
    <div>
      <p className="text-sm text-muted">Swipe or tap every square. Multi-touch is recorded if the browser reports more than one contact.</p>
      <p className="mt-2 text-sm font-semibold">
        {doneCount}/{total} · Multi-touch: {multi ? "detected" : "not detected yet"}
      </p>
      <div
        className="mt-4 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        onTouchStart={(e) => {
          if (e.touches.length > 1) setMulti(true);
        }}
      >
        {filled.map((on, i) => (
          <button
            key={i}
            type="button"
            className={`h-12 rounded-md ${on ? "bg-navy" : "bg-cream"}`}
            onPointerDown={() => mark(i, 1)}
            onPointerEnter={(e) => {
              if (e.buttons) mark(i, 1);
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Dead touch area", "Ghost touch", "No touch issue"].map((item) => (
          <Choice key={item} selected={issue === item} onClick={() => setIssue(item)} label={item} />
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary
          disabled={!complete}
          onClick={() => {
            const problem = issue && issue !== "No touch issue";
            onDone({
              key: "touch",
              label: "Touch",
              outcome: problem ? "Customer reported issue" : doneCount === total ? "Passed" : "Incomplete",
              source: problem ? "CUSTOMER" : doneCount === total ? "TEST_PASSED" : "CUSTOMER",
              detail: `Filled ${doneCount}/${total}${multi ? "; multi-touch detected" : ""}`,
            });
          }}
        >
          Continue
        </Primary>
      </div>
    </div>
  );
}
