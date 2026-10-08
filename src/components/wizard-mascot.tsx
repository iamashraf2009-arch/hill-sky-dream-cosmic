"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Hand,
  Mic,
  RotateCw,
  ArrowUp,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = "idle" | "wave" | "jump" | "spin" | "pose" | "talk" | "listen";

const PATHS = {
  idle: "/sprites/idle.png",
  pose: "/sprites/pose.png",
  back: "/sprites/back.png",
  side: "/sprites/side.png",
  wave: [1, 2, 3, 4].map((i) => `/sprites/wave-${i}.png`),
  jump: [1, 2, 3, 4].map((i) => `/sprites/jump-${i}.png`),
  talk: [1, 2, 3, 4].map((i) => `/sprites/talk-${i}.png`),
  listen: [1, 2, 3, 4].map((i) => `/sprites/listen-${i}.png`),
};

const ALL_SRC = [
  PATHS.idle,
  PATHS.pose,
  PATHS.back,
  PATHS.side,
  ...PATHS.wave,
  ...PATHS.jump,
  ...PATHS.talk,
  ...PATHS.listen,
];

const GREETINGS = [
  "Hello there. I am your wizard mascot. Ready for a photo?",
  "Greetings. Say wave, jump, spin, or pose.",
  "Hi. Tap listen and talk to me. I can wave, jump, and pose for pictures.",
  "Magic is in the air. What shall we do next?",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

type Recog = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onresult: ((e: SpeechResultEvent) => void) | null;
};

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

function getRecognition(): Recog | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => Recog;
    webkitSpeechRecognition?: new () => Recog;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function WizardMascot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const images = useRef<Record<string, HTMLImageElement>>({});
  const look = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const action = useRef<Action>("idle");
  const actionT = useRef(0);
  const talking = useRef(false);
  const listening = useRef(false);
  const recogRef = useRef<Recog | null>(null);
  const reduced = useRef(false);
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState("");
  const [transcript, setTranscript] = useState("");
  const [active, setActive] = useState<Action>("idle");
  const [ready, setReady] = useState(false);
  const [sayText, setSayText] = useState("");

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    Promise.all(ALL_SRC.map((s) => loadImage(s).then((img) => ({ s, img }))))
      .then((rows) => {
        if (cancelled) return;
        for (const { s, img } of rows) images.current[s] = img;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setStatus("Could not load sprites");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      look.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      look.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  const startAction = (next: Action) => {
    action.current = next;
    actionT.current = 0;
    setActive(next);
    (window as unknown as { __wizardRef?: string }).__wizardRef = next;
  };

  if (typeof window !== "undefined") {
    (window as unknown as { __wizardAction?: Action }).__wizardAction = active;
  }

  const doWave = () => {
    startAction("wave");
    setStatus("");
    setStatusKind("");
  };
  const doJump = () => {
    startAction("jump");
    setStatus("");
    setStatusKind("");
  };
  const doSpin = () => {
    startAction("spin");
    setStatus("");
    setStatusKind("");
  };
  const doPose = () => {
    startAction("pose");
    setStatus("Photo pose — hold still");
    setStatusKind("pose");
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      setStatus("Speech not supported");
      setStatusKind("");
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1.05;
    const voices = speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en/i.test(v.lang) && /google|samantha|daniel|natural/i.test(v.name)) ??
      voices.find((v) => /en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    talking.current = true;
    startAction("talk");
    setStatus("Talking");
    setStatusKind("talking");
    u.onend = () => {
      talking.current = false;
      if (action.current === "talk") startAction("idle");
      setStatus("");
      setStatusKind("");
    };
    u.onerror = () => {
      talking.current = false;
      if (action.current === "talk") startAction("idle");
      setStatus("");
      setStatusKind("");
    };
    speechSynthesis.speak(u);
  };

  const handleVoice = (cmd: string, original: string) => {
    if (/\b(wave|hi|hello|hey)\b/.test(cmd)) {
      doWave();
      speak(pick(["Hello.", "Hi there.", "Hey. Nice to see you."]));
      return;
    }
    if (/\bjump\b/.test(cmd)) {
      doJump();
      speak("Jumping.");
      return;
    }
    if (/\b(spin|twirl|turn)\b/.test(cmd)) {
      doSpin();
      speak("Spinning.");
      return;
    }
    if (/\b(pose|photo|picture|selfie|cheese)\b/.test(cmd)) {
      doPose();
      speak("Strike a pose. Say cheese.");
      return;
    }
    if (/\b(stop|quiet|shh)\b/.test(cmd)) {
      speechSynthesis.cancel();
      talking.current = false;
      startAction("idle");
      setStatus("");
      return;
    }
    speak(pick([`You said: ${original}.`, "Got it. Try saying wave, jump, spin, or pose."]));
    doWave();
  };

  const toggleListen = () => {
    if (listening.current && recogRef.current) {
      recogRef.current.stop();
      return;
    }
    const recog = getRecognition();
    if (!recog) {
      setStatus("Speech recognition is not available in this browser");
      setStatusKind("");
      return;
    }
    recogRef.current = recog;
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onstart = () => {
      listening.current = true;
      startAction("listen");
      setStatus("Listening — speak now");
      setStatusKind("listening");
    };
    recog.onend = () => {
      listening.current = false;
      if (action.current === "listen" && !talking.current) startAction("idle");
      if (!talking.current) {
        setStatus("");
        setStatusKind("");
      }
    };
    recog.onerror = (e) => {
      listening.current = false;
      startAction("idle");
      if (e.error === "not-allowed") setStatus("Microphone permission denied");
      else if (e.error !== "aborted") setStatus("Listen error");
      setStatusKind("");
    };
    recog.onresult = (ev) => {
      let interim = "";
      let final = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i]![0].transcript;
        if (ev.results[i]!.isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) handleVoice(final.trim().toLowerCase(), final.trim());
    };
    try {
      recog.start();
    } catch {
      setStatus("Could not start the microphone");
    }
  };

  useEffect(() => {
    if (window.speechSynthesis) {
      speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let time = 0;

    const resize = () => {
      const parent = wrapRef.current;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.floor(w * dpr));
      cv.height = Math.max(1, Math.floor(h * dpr));
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      actionT.current += dt;

      const L = look.current;
      const k = 1 - Math.exp(-6 * dt);
      L.x += (L.tx - L.x) * k;
      L.y += (L.ty - L.y) * k;

      const calm = reduced.current ? 0.2 : 1;
      let src = PATHS.idle;
      let hop = 0;
      let squash = 1;
      let spinScale = 1;
      let showBack = false;
      let showSide = false;

      const act = action.current;
      const t = actionT.current;

      if (act === "wave") {
        const f = Math.min(3, Math.floor((t / 1.7) * 4));
        src = PATHS.wave[f]!;
        if (t >= 1.7) startAction("idle");
      } else if (act === "jump") {
        const j = Math.min(1, t / 0.9);
        hop = Math.sin(j * Math.PI) * 70 * calm;
        squash = j < 0.12 ? 1 - 0.1 * (j / 0.12) : j > 0.88 ? 1 - 0.08 * ((1 - j) / 0.12) : 1 + 0.04 * Math.sin(j * Math.PI);
        const f = Math.min(3, Math.floor(j * 4));
        src = PATHS.jump[f]!;
        if (t >= 0.9) startAction("idle");
      } else if (act === "spin") {
        const p = Math.min(1, t / 1.35);
        const ang = p * Math.PI * 2;
        spinScale = Math.cos(ang);
        const a = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (a > Math.PI * 0.5 && a < Math.PI * 1.5) showBack = true;
        else if (Math.abs(spinScale) < 0.35) showSide = true;
        if (t >= 1.35) startAction("idle");
      } else if (act === "pose") {
        src = PATHS.pose;
        if (t >= 4.2) {
          startAction("idle");
          setStatus("");
          setStatusKind("");
        }
      } else if (act === "talk" || talking.current) {
        const f = Math.floor(time * 7) % 4;
        src = PATHS.talk[f]!;
      } else if (act === "listen" || listening.current) {
        const f = Math.floor(time * 3) % 4;
        src = PATHS.listen[f]!;
      } else {
        src = PATHS.idle;
      }

      if (showBack) src = PATHS.back;
      else if (showSide) src = PATHS.side;

      const img = images.current[src];
      const w = cv.width;
      const h = cv.height;
      ctx.clearRect(0, 0, w, h);

      const bob = Math.sin(time * 1.6) * 8 * calm * (act === "pose" ? 0.2 : 1);
      const y = hop + bob;

      const size = Math.min(w, h) * 0.78;
      const cx = w * 0.5 + L.x * w * 0.03;
      const cy = h * 0.52 - y * (w / (wrapRef.current?.clientWidth || w));

      ctx.save();
      ctx.translate(cx, cy + size * 0.38);
      ctx.scale(1, 0.28);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.28 * (1 - hop * 0.002), size * 0.28, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.35 - hop * 0.002})`;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(L.x * 0.12 * (act === "pose" ? 0.3 : 1));
      const sx = (spinScale < 0 ? -1 : 1) * Math.max(0.12, Math.abs(spinScale));
      ctx.scale(sx / Math.sqrt(squash), squash);
      if (img) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      }
      ctx.restore();
    };

    let cancelled = false;
    raf = requestAnimationFrame(draw);
    const intro = window.setTimeout(() => {
      if (!cancelled && action.current === "idle") doWave();
    }, 700);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(intro);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onSay = () => {
    if (talking.current) {
      speechSynthesis.cancel();
      talking.current = false;
      startAction("idle");
      setStatus("");
      return;
    }
    const custom = sayText.trim();
    speak(custom || pick(GREETINGS));
    if (!custom) doWave();
  };

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, var(--color-bg-2), var(--color-bg))",
        }}
      />
      <header className="relative z-10 flex flex-col items-center px-4 pt-[max(12px,env(safe-area-inset-top))] text-center">
        <p className="font-display text-lg font-medium tracking-tight text-fg sm:text-2xl">
          Wizard Mascot
        </p>
        <p className="mt-1 hidden max-w-md text-sm text-muted sm:block">
          Move your pointer and he follows. Click him to wave.
        </p>
        <p
          className={cn(
            "mt-1 min-h-5 text-xs sm:mt-2 sm:text-sm",
            statusKind === "listening" && "text-cyan",
            statusKind === "talking" && "text-primary",
            statusKind === "pose" && "text-fg",
            !statusKind && "text-muted",
          )}
          aria-live="polite"
        >
          {status || "Move the pointer — he looks at you"}
        </p>
      </header>

      <div
        ref={wrapRef}
        className="relative z-10 min-h-0 flex-1 cursor-pointer touch-none"
        onClick={() => {
          if (action.current === "idle") doWave();
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          aria-label="Animated 2D wizard mascot"
        />
        {!ready && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            Summoning the wizard…
          </p>
        )}
      </div>

      <p className="relative z-10 min-h-5 px-4 text-center text-sm text-muted">
        {transcript}
      </p>

      <form
        className="relative z-10 mx-auto flex w-full max-w-lg gap-2 px-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSay();
        }}
      >
        <input
          value={sayText}
          onChange={(e) => setSayText(e.target.value)}
          placeholder="Type something for him to say"
          suppressHydrationWarning
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-sm text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Message for the wizard to speak"
        />
        <Button type="submit" variant="default" size="sm">
          Speak
        </Button>
      </form>

      <nav className="relative z-10 flex flex-wrap justify-center gap-2 px-3 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
        <Button variant={active === "wave" ? "active" : "ghost"} onClick={doWave}>
          <Hand className="size-4" />
          Wave
        </Button>
        <Button variant={active === "jump" ? "active" : "ghost"} onClick={doJump}>
          <ArrowUp className="size-4" />
          Jump
        </Button>
        <Button variant={active === "spin" ? "active" : "ghost"} onClick={doSpin}>
          <RotateCw className="size-4" />
          Spin
        </Button>
        <Button variant={active === "pose" ? "active" : "ghost"} onClick={doPose}>
          <Camera className="size-4" />
          Photo pose
        </Button>
        <Button
          variant={active === "listen" ? "active" : "ghost"}
          onClick={toggleListen}
        >
          <Mic className="size-4" />
          Listen
        </Button>
        <Button variant={active === "talk" ? "active" : "ghost"} onClick={onSay}>
          <Volume2 className="size-4" />
          Say hi
        </Button>
      </nav>
    </div>
  );
}
