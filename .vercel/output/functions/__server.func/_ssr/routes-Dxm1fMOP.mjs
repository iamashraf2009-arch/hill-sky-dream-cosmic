import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Hand, i as Mic, o as Camera, r as RotateCw, s as ArrowUp, t as Volume2 } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dxm1fMOP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[opacity,transform,background-color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] select-none", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			ghost: "bg-surface/80 text-fg border border-border hover:bg-surface-2",
			outline: "border border-border bg-transparent text-fg hover:bg-surface",
			active: "bg-primary/35 text-fg border border-primary/60 hover:bg-primary/45"
		},
		size: {
			default: "h-11 px-5 text-sm",
			sm: "h-10 px-4 text-sm"
		}
	},
	defaultVariants: {
		variant: "ghost",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var PATHS = {
	idle: "/sprites/idle.png",
	pose: "/sprites/pose.png",
	back: "/sprites/back.png",
	side: "/sprites/side.png",
	wave: [
		1,
		2,
		3,
		4
	].map((i) => `/sprites/wave-${i}.png`),
	jump: [
		1,
		2,
		3,
		4
	].map((i) => `/sprites/jump-${i}.png`),
	talk: [
		1,
		2,
		3,
		4
	].map((i) => `/sprites/talk-${i}.png`),
	listen: [
		1,
		2,
		3,
		4
	].map((i) => `/sprites/listen-${i}.png`)
};
var ALL_SRC = [
	PATHS.idle,
	PATHS.pose,
	PATHS.back,
	PATHS.side,
	...PATHS.wave,
	...PATHS.jump,
	...PATHS.talk,
	...PATHS.listen
];
var GREETINGS = [
	"Hello there. I am your wizard mascot. Ready for a photo?",
	"Greetings. Say wave, jump, spin, or pose.",
	"Hi. Tap listen and talk to me. I can wave, jump, and pose for pictures.",
	"Magic is in the air. What shall we do next?"
];
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`Failed to load ${src}`));
		img.src = src;
	});
}
function getRecognition() {
	const w = window;
	const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
	return Ctor ? new Ctor() : null;
}
function WizardMascot() {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const images = (0, import_react.useRef)({});
	const look = (0, import_react.useRef)({
		x: 0,
		y: 0,
		tx: 0,
		ty: 0
	});
	const action = (0, import_react.useRef)("idle");
	const actionT = (0, import_react.useRef)(0);
	const talking = (0, import_react.useRef)(false);
	const listening = (0, import_react.useRef)(false);
	const recogRef = (0, import_react.useRef)(null);
	const reduced = (0, import_react.useRef)(false);
	const [status, setStatus] = (0, import_react.useState)("");
	const [statusKind, setStatusKind] = (0, import_react.useState)("");
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)("idle");
	const [ready, setReady] = (0, import_react.useState)(false);
	const [sayText, setSayText] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let cancelled = false;
		Promise.all(ALL_SRC.map((s) => loadImage(s).then((img) => ({
			s,
			img
		})))).then((rows) => {
			if (cancelled) return;
			for (const { s, img } of rows) images.current[s] = img;
			setReady(true);
		}).catch(() => {
			if (!cancelled) setStatus("Could not load sprites");
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el) return;
		const onMove = (e) => {
			const r = el.getBoundingClientRect();
			look.current.tx = ((e.clientX - r.left) / r.width - .5) * 2;
			look.current.ty = ((e.clientY - r.top) / r.height - .5) * 2;
		};
		el.addEventListener("pointermove", onMove);
		return () => el.removeEventListener("pointermove", onMove);
	}, []);
	const startAction = (next) => {
		action.current = next;
		actionT.current = 0;
		setActive(next);
		window.__wizardRef = next;
	};
	if (typeof window !== "undefined") window.__wizardAction = active;
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
	const speak = (text) => {
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
		const preferred = voices.find((v) => /en/i.test(v.lang) && /google|samantha|daniel|natural/i.test(v.name)) ?? voices.find((v) => /en/i.test(v.lang));
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
	const handleVoice = (cmd, original) => {
		if (/\b(wave|hi|hello|hey)\b/.test(cmd)) {
			doWave();
			speak(pick([
				"Hello.",
				"Hi there.",
				"Hey. Nice to see you."
			]));
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
				const t = ev.results[i][0].transcript;
				if (ev.results[i].isFinal) final += t;
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
	(0, import_react.useEffect)(() => {
		if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
	}, []);
	(0, import_react.useEffect)(() => {
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
		const draw = (now) => {
			raf = requestAnimationFrame(draw);
			const dt = Math.min((now - last) / 1e3, .05);
			last = now;
			time += dt;
			actionT.current += dt;
			const L = look.current;
			const k = 1 - Math.exp(-6 * dt);
			L.x += (L.tx - L.x) * k;
			L.y += (L.ty - L.y) * k;
			const calm = reduced.current ? .2 : 1;
			let src = PATHS.idle;
			let hop = 0;
			let squash = 1;
			let spinScale = 1;
			let showBack = false;
			let showSide = false;
			const act = action.current;
			const t = actionT.current;
			if (act === "wave") {
				const f = Math.min(3, Math.floor(t / 1.7 * 4));
				src = PATHS.wave[f];
				if (t >= 1.7) startAction("idle");
			} else if (act === "jump") {
				const j = Math.min(1, t / .9);
				hop = Math.sin(j * Math.PI) * 70 * calm;
				squash = j < .12 ? 1 - .1 * (j / .12) : j > .88 ? 1 - .08 * ((1 - j) / .12) : 1 + .04 * Math.sin(j * Math.PI);
				const f = Math.min(3, Math.floor(j * 4));
				src = PATHS.jump[f];
				if (t >= .9) startAction("idle");
			} else if (act === "spin") {
				const ang = Math.min(1, t / 1.35) * Math.PI * 2;
				spinScale = Math.cos(ang);
				const a = (ang % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
				if (a > Math.PI * .5 && a < Math.PI * 1.5) showBack = true;
				else if (Math.abs(spinScale) < .35) showSide = true;
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
				src = PATHS.talk[f];
			} else if (act === "listen" || listening.current) {
				const f = Math.floor(time * 3) % 4;
				src = PATHS.listen[f];
			} else src = PATHS.idle;
			if (showBack) src = PATHS.back;
			else if (showSide) src = PATHS.side;
			const img = images.current[src];
			const w = cv.width;
			const h = cv.height;
			ctx.clearRect(0, 0, w, h);
			const bob = Math.sin(time * 1.6) * 8 * calm * (act === "pose" ? .2 : 1);
			const y = hop + bob;
			const size = Math.min(w, h) * .78;
			const cx = w * .5 + L.x * w * .03;
			const cy = h * .52 - y * (w / (wrapRef.current?.clientWidth || w));
			ctx.save();
			ctx.translate(cx, cy + size * .38);
			ctx.scale(1, .28);
			ctx.beginPath();
			ctx.ellipse(0, 0, size * .28 * (1 - hop * .002), size * .28, 0, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(0,0,0,${.35 - hop * .002})`;
			ctx.fill();
			ctx.restore();
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(L.x * .12 * (act === "pose" ? .3 : 1));
			const sx = (spinScale < 0 ? -1 : 1) * Math.max(.12, Math.abs(spinScale));
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0",
				style: { background: "radial-gradient(60% 50% at 50% 42%, var(--color-bg-2), var(--color-bg))" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex flex-col items-center px-4 pt-[max(12px,env(safe-area-inset-top))] text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-medium tracking-tight text-fg sm:text-2xl",
						children: "Wizard Mascot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 hidden max-w-md text-sm text-muted sm:block",
						children: "Move your pointer and he follows. Click him to wave."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1 min-h-5 text-xs sm:mt-2 sm:text-sm", statusKind === "listening" && "text-cyan", statusKind === "talking" && "text-primary", statusKind === "pose" && "text-fg", !statusKind && "text-muted"),
						"aria-live": "polite",
						children: status || "Move the pointer — he looks at you"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				className: "relative z-10 min-h-0 flex-1 cursor-pointer touch-none",
				onClick: () => {
					if (action.current === "idle") doWave();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "block h-full w-full",
					"aria-label": "Animated 2D wizard mascot"
				}), !ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "absolute inset-0 flex items-center justify-center text-sm text-muted",
					children: "Summoning the wizard…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative z-10 min-h-5 px-4 text-center text-sm text-muted",
				children: transcript
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "relative z-10 mx-auto flex w-full max-w-lg gap-2 px-4",
				onSubmit: (e) => {
					e.preventDefault();
					onSay();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: sayText,
					onChange: (e) => setSayText(e.target.value),
					placeholder: "Type something for him to say",
					suppressHydrationWarning: true,
					className: "h-11 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-sm text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					"aria-label": "Message for the wizard to speak"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "default",
					size: "sm",
					children: "Speak"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "relative z-10 flex flex-wrap justify-center gap-2 px-3 pb-[max(18px,env(safe-area-inset-bottom))] pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: active === "wave" ? "active" : "ghost",
						onClick: doWave,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, { className: "size-4" }), "Wave"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: active === "jump" ? "active" : "ghost",
						onClick: doJump,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" }), "Jump"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: active === "spin" ? "active" : "ghost",
						onClick: doSpin,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "size-4" }), "Spin"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: active === "pose" ? "active" : "ghost",
						onClick: doPose,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), "Photo pose"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: active === "listen" ? "active" : "ghost",
						onClick: toggleListen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }), "Listen"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: active === "talk" ? "active" : "ghost",
						onClick: onSay,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), "Say hi"]
					})
				]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WizardMascot, {});
}
//#endregion
export { Home as component };
