"use client";

import { useRef, useState } from "react";
import type { TestResult } from "@/lib/diagnosis";
import { Back, Choice, Primary } from "./ui";

export function AudioStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (results: TestResult[]) => void;
}) {
  const [mic, setMic] = useState<"idle" | "listening" | "ok" | "denied" | "unsupported">("idle");
  const [level, setLevel] = useState(0);
  const [speaker, setSpeaker] = useState("");
  const ctxRef = useRef<AudioContext | null>(null);

  async function startMic() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMic("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      setMic("listening");
      const started = Date.now();
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += Math.abs(v - 128);
        const next = Math.min(100, Math.round((sum / data.length) * 4));
        setLevel(next);
        if (next > 8) setMic("ok");
        if (Date.now() - started < 4000 && mic !== "ok") requestAnimationFrame(tick);
        else {
          stream.getTracks().forEach((t) => t.stop());
          void ctx.close();
        }
      };
      requestAnimationFrame(tick);
      setTimeout(() => {
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      }, 4500);
    } catch {
      setMic("denied");
    }
  }

  function playTone() {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
    osc.onended = () => void ctx.close();
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Microphone input is checked with a short sample that is discarded immediately. Speaker hardware cannot be verified from a website — please confirm after the test tone.
      </p>
      <div className="mt-4 rounded-2xl bg-cream p-4">
        <p className="font-semibold">Microphone test</p>
        <button type="button" onClick={startMic} className="mt-3 min-h-12 rounded-full bg-navy px-5 py-3 font-semibold text-white">
          Start test
        </button>
        <p className="mt-2 text-sm">
          {mic === "idle" && "Not started"}
          {mic === "listening" && `Listening… speak now (${level}%)`}
          {mic === "ok" && "Microphone input detected"}
          {mic === "denied" && "Microphone permission was denied."}
          {mic === "unsupported" && "This test isn't supported on your device/browser."}
        </p>
      </div>
      <div className="mt-4 rounded-2xl bg-cream p-4">
        <p className="font-semibold">Speaker test</p>
        <button type="button" onClick={playTone} className="mt-3 min-h-12 rounded-full border px-5 py-3 font-semibold">
          Play test sound
        </button>
        <div className="mt-3 flex flex-wrap gap-2">
          <Choice selected={speaker === "working"} onClick={() => setSpeaker("working")} label="Speaker working" />
          <Choice selected={speaker === "issue"} onClick={() => setSpeaker("issue")} label="Speaker issue" />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary
          disabled={!speaker}
          onClick={() => {
            const results: TestResult[] = [
              {
                key: "microphone",
                label: "Microphone",
                outcome: mic === "ok" ? "Passed" : mic === "denied" ? "Permission denied" : mic === "unsupported" ? "Unable to test" : "No input detected",
                source: mic === "ok" ? "TEST_PASSED" : mic === "denied" ? "DENIED" : mic === "unsupported" ? "UNSUPPORTED" : "CUSTOMER",
              },
              {
                key: "speaker",
                label: "Speaker",
                outcome: speaker === "working" ? "Customer confirmed working" : "Customer reported issue",
                source: "CUSTOMER",
                detail: "Websites cannot fully diagnose speaker hardware.",
              },
            ];
            onDone(results);
          }}
        >
          Continue
        </Primary>
      </div>
    </div>
  );
}
