import {
  WebComponentAttributeMapper,
  WebComponentAttributesMapper,
} from "./AttributeMapper";
import {
  delay,
  describeArc,
  describeRotatedText,
  logError,
  polarToCartesian,
} from "./util";

export interface SegmentDescription<V> {
  backgroundColor?: string;
  textColor?: string;
  strokeColor?: string;
  text: string;
  value: V;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["spinning-choice-wheel"]: Partial<WheelComponentAttributes<string>>;
    }
  }
}

const DEFAULT_DURATION = 5;
const DEFAULT_RPS = 3;
const DEFAULT_BACKGROUND_COLOR = "black";
const DEFAULT_TEXT_COLOR = "white";
const DEFAULT_STROKE_COLOR = "grey";
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_LOGO_SIZE = 100;
const DEFAULT_POINTER_SIZE = 20;
const DEFAULT_POINTER_ANGLE = 45;
const DEFAULT_POINTER_OFFSET = 2;
const DEFAULT_POINTER_IMAGE =
  "data:image/png;base64,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o2/KAn23QNeq21tjH6cPQJq6WroBDg6B0QJlr3m8u7O1t3/PNPr7AWY0cqLD1BzBAAAN92lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDpkZThiMWY1OC05YTg1LTQ1NWItOThjYS04YmQwZGUzNTIwMWIiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MWM2YTVlYTAtMjAyMi00NGNjLTk2ZDktNmE0NTBiZGQ5NTM0IgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OGNhYTY0ZmYtNWMwZS00OTE1LTk5NGUtMjI2ODNiMjIxMjNmIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2NzAzNjE0MjA3Mjk3NDgiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zMCIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmYmY3YTY5Yy1lNmUxLTQxM2QtOTVmZS1jMmU2NTY5YzA2MmIiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjItMTItMDZUMTU6NTU6MzkiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzg1OGYxNjktZWRmMS00ZDY4LTljZTMtOWMyNTMzZWQ1NWE3IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIyLTEyLTA2VDE2OjE3OjAwIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pq57m2sAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAHdElNRQfmDAYVEQClZqJpAAAAxUlEQVRYw93YzQ4DIQgEYJn3f2d66KHJptsVHGBSjirm8wcP2nqHr0/YEgq74OSQuGl3daAMEg/9rg4cR2JznKsDx5AIjncJoLvLIG93UAX584gVkI93cBq5VSSTyO0qnkKGnpkJZPQdbEcik9SJRDaxC4mT5A4kTieoRoKxykokWHelCglmxVUgqcAKJB3IRpYAmcgyIAtZCmQgy4GnyBbgCbINmEW2AjPIdmAUOQKMIG0JfVZ+CVMHzh3x3wCt6wsj63sBsRlz3J7w3X0AAAAASUVORK5CYII=";

interface WheelComponentAttributes<V> extends HTMLElement {
  ref: MutableRef<SpinningChoiceWheelComponent<V>>;
  segments?: string;
  "logo-image"?: string;
  "logo-size"?: string;
  "pointer-image"?: string;
  "pointer-size"?: string;
  "pointer-angle"?: string;
  "pointer-offset"?: string;
  "on-wheel-stopped"?: string;
  "on-wheel-started"?: string;
  duration?: string;
  "stroke-color"?: string;
  "stroke-width"?: string;
}

const css = `
:host(spinning-choice-wheel) {
  display: block;
  box-sizing: border-box;
  width: 300px;
  height: 300px;
}

 div.root, div.wheel-fixed, div.wheel-spinning {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: block;
  position: relative;
  overflow: hidden;
 }
 div.wheel-fixed {
  position: absolute;
  pointer-events: none;
  z-index: 1
 }

 div.pointer {
  position: absolute;
    left: 57%;
    top: 16%;
    width: 40px;
    height: 40px;
  background-color: white;
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  border-bottom-right-radius: 100px;
 }

 svg {
  width: 100%;
  height: 100%;
 }
`;

type MutableRef<V> = {
  current: V | null;
};

export class SpinningChoiceWheelComponent<V> extends HTMLElement {
  #segments_parsed: SegmentDescription<V>[] = [];
  get segments() {
    return this.#segments_parsed;
  }

  set segments(newValue: SegmentDescription<V>[]) {
    console.log("Property updated");

    if (!Array.isArray(newValue)) {
      throw new Error("segments must be an array");
    }
    this.#segments_parsed = newValue;
    this.#buildDom();
  }

  onWheelStopped?: (value: V) => void;
  onWheelStarted?: (duration: number) => void;

  logoImage?: string;
  logoSize?: number;
  pointerImage?: string;
  pointerSize?: number;
  duration?: number;
  strokeColor?: string;
  strokeWidth?: number;
  pointerAngle?: number;
  pointerOffset?: number;

  #refInternal: MutableRef<SpinningChoiceWheelComponent<V>> = { current: this };
  get ref() {
    return this.#refInternal;
  }
  set ref(refObj: MutableRef<SpinningChoiceWheelComponent<V>>) {
    logError(() => {
      if (refObj) {
        this.#refInternal = refObj;
        refObj.current = this;
      }
    }, "Error while trying to set reference");
  }

  static get observedAttributes() {
    return [
      "segments",
      "logo-image",
      "logo-size",
      "pointer-image",
      "pointer-size",
      "pointer-angle",
      "pointer-offset",
      "on-wheel-stopped",
      "on-wheel-started",
      "duration",
      "stroke-color",
      "stroke-width",
    ];
  }

  #attributeMapper: WebComponentAttributesMapper;

  constructor() {
    super();
    this.#attributeMapper = new WebComponentAttributesMapper(
      [
        { propertyName: "segments", parse: true },
        { propertyName: "strokeColor" },
        { propertyName: "strokeWidth", parse: true },
        { propertyName: "logoImage" },
        { propertyName: "logoSize", parse: true },
        { propertyName: "pointerImage" },
        { propertyName: "pointerSize", parse: true },
        { propertyName: "pointerAngle", parse: true },
        { propertyName: "pointerOffset", parse: true },
        { propertyName: "onWheelStopped", parse: "function" },
        { propertyName: "onWheelStarted", parse: "function" },
        { propertyName: "duration", parse: true },
      ],
      this
    );

    const shadow = this.attachShadow({ mode: "open" });
    this.#parseAttributes();
    this.#buildStaticDom();
    this.#buildDom();
  }

  #buildStaticDom() {
    const shadow = this.shadowRoot;
    if (!shadow) {
      return;
    }
    const style = document.createElement("style");
    style.innerHTML = css;
    shadow.appendChild(style);

    const root = document.createElement("div");
    root.classList.add("root");
    shadow.appendChild(root);
  }

  #buildDom() {
    if (!this.segments || this.segments.length < 1 || !this.shadowRoot) {
      return;
    }
    const shadow = this.shadowRoot;
    const root = shadow.querySelector("div.root");
    if (!root) {
      return;
    }
    root.childNodes.forEach((node) => node.remove());

    const wheelSpinning = document.createElement("div");
    wheelSpinning.classList.add("wheel-spinning");
    root.appendChild(wheelSpinning);

    const wheelFixed = document.createElement("div");
    wheelFixed.classList.add("wheel-fixed");
    root.appendChild(wheelFixed);

    const svgSpinning = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    wheelSpinning.appendChild(svgSpinning);

    svgSpinning.onclick = this.handleClick.bind(this);
    svgSpinning.setAttribute("viewBox", "0 0 300 300");
    const angleWidth = 360 / this.segments.length;
    let currentAngle = 0;

    const paths = this.segments.map((segment, index) => {
      const path = `<path id="arc${index}" fill="${
        segment.backgroundColor || DEFAULT_BACKGROUND_COLOR
      }" stroke="${
        segment.strokeColor || this.strokeColor || DEFAULT_STROKE_COLOR
      }" stroke-width="${
        this.strokeWidth ?? DEFAULT_STROKE_WIDTH
      }" d="${describeArc(
        150,
        150,
        100,
        currentAngle,
        currentAngle + angleWidth
      )}" /><text fill="${
        segment.textColor || DEFAULT_TEXT_COLOR
      }" ${describeRotatedText(150, 150, 50, currentAngle + angleWidth / 2)}>${
        segment.text
      }</text>`;
      currentAngle += angleWidth;
      return path;
    });

    svgSpinning.innerHTML = paths.join("\r\n");

    const svgFixed = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgFixed.setAttribute("viewBox", "0 0 300 300");

    const fixedSvgHtml = [];
    if (this.logoImage) {
      const size = this.logoSize || DEFAULT_LOGO_SIZE;
      const halfSize = size / 2;
      fixedSvgHtml.push(
        `<image width="${size}" height="${size}" x="${150 - halfSize}" y="${
          150 - halfSize
        }" href="${this.logoImage}" />`
      );
    }

    const pointer = this.pointerImage || DEFAULT_POINTER_IMAGE;
    const bottomLeft = polarToCartesian(
      150,
      150,
      100 - (this.pointerOffset || DEFAULT_POINTER_OFFSET),
      this.pointerAngle || DEFAULT_POINTER_ANGLE
    );
    const size = this.pointerSize || DEFAULT_POINTER_SIZE;
    fixedSvgHtml.push(
      `<image width="${size}" height="${size}" x="${bottomLeft.x}" y="${
        bottomLeft.y - size
      }" href="${pointer}" />`
    );

    svgFixed.innerHTML = fixedSvgHtml.join("\r\n");
    if (fixedSvgHtml.length > 0) {
      wheelFixed.appendChild(svgFixed);
    }
  }

  async handleClick() {
    const svg = this.shadowRoot?.querySelector(
      "div.wheel-spinning"
    ) as HTMLElement;
    if (!svg) {
      return;
    }
    const revolutionsPerSecond = DEFAULT_RPS;
    const spinDuration = this.duration || DEFAULT_DURATION;
    if (this.onWheelStarted) {
      logError(() => this.onWheelStarted!(spinDuration));
    }
    svg.style.transition = `${spinDuration}s ease transform`;
    const r = Math.random() * 360;
    svg.style.transform = `rotate(${
      360 * revolutionsPerSecond * spinDuration + r
    }deg)`;
    await delay(spinDuration * 1000 + 100);
    svg.style.transition = "";
    svg.style.transform = `rotate(${r}deg)`;
    if (this.onWheelStopped) {
      const index = Math.floor((((r + 90) % 360) / 360) * this.segments.length);
      const segment = this.segments.at(-index);
      const value = segment!.value;
      this.onWheelStopped(value);
    }
  }

  attributeChangedCallback(...args: any[]) {
    console.log("Attribute changed", ...args);
    this.#parseAttributes();
    this.#buildDom();
  }

  #parseAttributes() {
    this.#attributeMapper.check();
  }
}

window.customElements.define(
  "spinning-choice-wheel",
  SpinningChoiceWheelComponent
);
