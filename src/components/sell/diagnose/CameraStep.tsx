"use client";

import { useEffect, useRef, useState } from "react";
import type { TestResult } from "@/lib/diagnosis";
import { Back, Primary } from "./ui";

export function CameraStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (results: TestResult[]) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState("");
  const [shots, setShots] = useState<{ rear?: boolean; front?: boolean }>({});
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      stop();
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported in this browser.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setDenied(true);
        setError("Camera permission was denied.");
      }
    }
    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [facing]);

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function capture() {
    const video = videoRef.current;
    if (!video || video.videoWidth < 2) {
      setError("Camera did not produce an image. Try again or continue manually.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(() => {
      setShots((s) => ({ ...s, [facing === "environment" ? "rear" : "front"]: true }));
    }, "image/jpeg", 0.6);
  }

  function finish(manual = false) {
    stop();
    const results: TestResult[] = [];
    if (denied || manual) {
      results.push({
        key: "cameraRear",
        label: "Rear camera",
        outcome: "Unable to test",
        source: denied ? "DENIED" : "UNSUPPORTED",
        detail: error || "Continued without camera permission.",
      });
      results.push({
        key: "cameraFront",
        label: "Front camera",
        outcome: "Unable to test",
        source: denied ? "DENIED" : "UNSUPPORTED",
      });
    } else {
      results.push({
        key: "cameraRear",
        label: "Rear camera",
        outcome: shots.rear ? "Passed" : "Not captured",
        source: shots.rear ? "TEST_PASSED" : "CUSTOMER",
      });
      results.push({
        key: "cameraFront",
        label: "Front camera",
        outcome: shots.front ? "Passed" : "Not captured",
        source: shots.front ? "TEST_PASSED" : "CUSTOMER",
      });
    }
    onDone(results);
  }

  return (
    <div>
      <p className="text-sm text-muted">Please allow camera access to test your front and rear cameras. Photos are captured only when you press Capture, and these test shots are not kept.</p>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <video ref={videoRef} autoPlay playsInline muted className="mt-4 h-56 w-full rounded-2xl bg-navy object-cover" />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={capture} className="min-h-12 rounded-full bg-gold px-5 py-3 font-semibold text-navy">
          Capture {facing === "environment" ? "rear" : "front"} test
        </button>
        <button
          type="button"
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          className="min-h-12 rounded-full border px-5 py-3 font-semibold"
        >
          Switch to {facing === "environment" ? "front" : "rear"}
        </button>
      </div>
      <p className="mt-3 text-sm">
        Rear: {shots.rear ? "Captured" : "Pending"} · Front: {shots.front ? "Captured" : "Pending"}
      </p>
      <div className="mt-6 flex gap-3">
        <Back onClick={onBack} />
        <Primary onClick={() => finish(false)} disabled={!denied && !shots.rear && !shots.front}>
          Continue
        </Primary>
      </div>
      <button type="button" onClick={() => finish(true)} className="mt-3 text-sm font-semibold text-muted">
        Camera permission was denied — continue manually
      </button>
    </div>
  );
}
