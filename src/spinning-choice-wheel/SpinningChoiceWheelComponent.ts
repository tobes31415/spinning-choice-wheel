import {
  WebComponentAttributeMapper,
  WebComponentAttributesMapper,
} from "./AttributeMapper";
import {
  clamp,
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
  fontSize?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["spinning-choice-wheel"]: Partial<WheelComponentAttributes<string>>;
    }
  }
}

const DEFAULT_SPINNER_BACKGROUND_COLOR = "grey";
const DEFAULT_DURATION = 5;
const DEFAULT_RPS = 3;
const DEFAULT_BACKGROUND_COLOR = "black";
const DEFAULT_TEXT_COLOR = "white";
const DEFAULT_TEXT_OFFSET = 10;
const DEFAULT_STROKE_COLOR = "grey";
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_LOGO_SIZE = 50;
const DEFAULT_POINTER_SIZE = 20;
const DEFAULT_POINTER_ANGLE = 45;
const DEFAULT_POINTER_OFFSET = 2;
const DEFAULT_POINTER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVQTsUcchQnSyIijpKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrHFA1y0jFY2I2tyoGXhFEAAOYQVhipp5IL2bgOb7u4ePrXZRneZ/7c/QpeZMBPpF4jumGRbxBPL1p6Zz3iUOsJCnE58RjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8RRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZrDiGMJCSQhQkYNZVRgIUqrRoqJFO3HPPxDjj9JLplcZTByLKAKFZLjB/+D392ahckJNykYA7pfbPtjBAjsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQI6N8GLq7bmrwHXO4A4SddMiRH8tMUCgXg/Yy+KQcM3gK9a25vrX2cPgAZ6mr5Bjg4BEaLlL3u8e6ezt7+PdPq7wexInLAMzMX8QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+YMBxMDBGbODXQAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAACZ0lEQVR42u3dMW4aURiF0fcykWhZwNSzBrZgL8oSm/I0U0ExW6IYcdOkiOLYVuJIYP/nkxCl5XcP8LppTaXrN/77McFtN/jm/GsHAAD30fF4bEm+/Ot4PPr9+dMdIKlzHei9uwPIT4AAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAAgAASAABIAAEAACQAAIAAEgAASAABAAAkAACAABIAAEgAAQAAJAAADgCAAQAAJAAAgAASAABIAAEAD66n3/+e4p3rfrVmfffQPoPgA8PT2VOvR7+n/7W19FDw8P7fn52cfkk/b4+NjmeX5z92+vYGittbauazufz6We7P0lLhVJO5/PbV3X9z70r15K0lpL7z3jOGZZlmzbFt1/27ZlWZaM45jee37d829vpmmtZRiGTNOUeZ5zuVyc8B13uVwyz3OmacowDP88/gsEu90uh8Mh67pCcMfjr+uaw+GQ3W734fEhMD4ExofA+BAYHwLjQ2B8CIwPgfEhMD4ExofA+BAYHwLjQ2B8CIwPgfEhMD4ExofA+BAYHwLjQ2B8CIwPgfEhMH5tBMYvjMD4hREYvzAC4xdGYPzCCIxfGIHxCyMwfmEExi+MwPiFERi/MALjF0Zg/MIIjF8YgfELIzB+YQTGL4zA+IURGL8wAuMXRmD8wgiMXxiB8YsgmOf5xeNvtm3LPM/Gr4BgmqYsy5Lr9ZokuV6vWZYl0zQZvwKCYRgyjmNOp1OS5HQ6ZRzH//KMHX0SBL337Pf7JMl+v//Q07U+e70gAmdSGMB7CMqdR0UAryEoeRZVAfyOoPI5qHI/AHopCpoh7HsYAAAAAElFTkSuQmCC";

interface WheelComponentAttributes<V> extends HTMLElement {
  ref: MutableRef<SpinningChoiceWheelComponent<V>>;
  segments?: string;
  "logo-image"?: string;
  "logo-size"?: string;
  "logo-spins"?: string;
  "pointer-image"?: string;
  "pointer-size"?: string;
  "pointer-angle"?: string;
  "pointer-offset"?: string;
  "on-wheel-stopped"?: string;
  "on-wheel-started"?: string;
  duration?: string;
  "stroke-color"?: string;
  "stroke-width"?: string;
  shadow?: string;
  "spinner-background-color"?: string;
}

const css = `
:host(spinning-choice-wheel) {
  display: block;
  box-sizing: border-box;
  width: 300px;
  height: 300px;
}

 div.root, div.wheel-fixed, div.wheel-spinning, div.wheel-background {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: block;
  position: relative;
  overflow: hidden;
 }
 div.wheel-fixed, div.wheel-background {
  position: absolute;
  pointer-events: none;
 }

 div.wheel-background {
  z-index: 1;
 }
 div.wheel-spinning {
  z-index: 2;
 }
  div.wheel-fixed {
  z-index: 3;
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

 .shadow {
  filter: drop-shadow(2px 4px 6px grey);
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
  logoSpins?: boolean;
  pointerImage?: string;
  pointerSize?: number;
  duration?: number;
  strokeColor?: string;
  strokeWidth?: number;
  pointerAngle?: number;
  pointerOffset?: number;
  shadow?: string;
  spinnerBackgroundColor?: string;

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
      "logo-spins",
      "pointer-image",
      "pointer-size",
      "pointer-angle",
      "pointer-offset",
      "on-wheel-stopped",
      "on-wheel-started",
      "duration",
      "stroke-color",
      "stroke-width",
      "shadow",
      "spinner-background-color",
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
        { propertyName: "logoSpins", parse: true },
        { propertyName: "pointerImage" },
        { propertyName: "pointerSize", parse: true },
        { propertyName: "pointerAngle", parse: true },
        { propertyName: "pointerOffset", parse: true },
        { propertyName: "onWheelStopped", parse: "function" },
        { propertyName: "onWheelStarted", parse: "function" },
        { propertyName: "duration", parse: true },
        { propertyName: "shadow" },
        { propertyName: "spinnerBackgroundColor" },
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
    if (!this.shadowRoot) {
      return;
    }
    const shadow = this.shadowRoot;
    const root = shadow.querySelector("div.root");
    if (!root) {
      return;
    }
    while (root.firstChild) {
      root.lastChild?.remove();
    }
    root.childNodes.forEach((node) => node.remove());

    const wheelBackground = document.createElement("div");
    wheelBackground.classList.add("wheel-background");
    if (this.shadow !== "none") {
      wheelBackground.classList.add("shadow");
    }
    root.appendChild(wheelBackground);

    const wheelFixed = document.createElement("div");
    wheelFixed.classList.add("wheel-fixed");
    if (this.shadow !== "none") {
      wheelFixed.classList.add("shadow");
    }
    root.appendChild(wheelFixed);

    const wheelSpinning = document.createElement("div");
    wheelSpinning.classList.add("wheel-spinning");
    root.appendChild(wheelSpinning);

    const svgSpinning = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    wheelSpinning.appendChild(svgSpinning);

    const svgBackground = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgBackground.setAttribute("viewBox", "0 0 300 300");
    wheelBackground.appendChild(svgBackground);

    svgSpinning.onclick = this.handleClick.bind(this);
    svgSpinning.setAttribute("viewBox", "0 0 300 300");
    const angleWidth = 360 / this.segments.length;
    let currentAngle = 0;

    const textStart =
      (this.logoSize || DEFAULT_LOGO_SIZE) / 2 + DEFAULT_TEXT_OFFSET;
    const textLength = 100 - textStart - DEFAULT_TEXT_OFFSET;
    const paths = [];
    if (this.segments && this.segments.length >= 1) {
      paths.push(
        ...this.segments.map((segment, index) => {
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
          }" ${describeRotatedText(
            150,
            150,
            textStart,
            currentAngle + angleWidth / 2
          )} lengthAdjust="spacingAndGlyphs" textLength="${textLength}" ${
            segment.fontSize ? `style="font-size: ${segment.fontSize}px"` : ""
          }>${segment.text}</text>`;
          currentAngle += angleWidth;
          return path;
        })
      );
    }
    if (this.logoSpins) {
      this.#generateLogo(paths);
    }

    svgSpinning.innerHTML = paths.join("\r\n");

    const svgFixed = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgFixed.setAttribute("viewBox", "0 0 300 300");

    const fixedSvgHtml: string[] = [];
    const spinnerColor =
      this.spinnerBackgroundColor || DEFAULT_SPINNER_BACKGROUND_COLOR;
    svgBackground.innerHTML = `<path id="arc-empty" fill="${spinnerColor}" stroke="${spinnerColor}" stroke-width="1" d="M 150 150  149.99999 50 A 100 100 0 1 0 150 50 Z"></path>`;
    if (!this.logoSpins) {
      this.#generateLogo(fixedSvgHtml);
    }

    const pointer = this.pointerImage || DEFAULT_POINTER_IMAGE;
    const pA = this.pointerAngle ?? DEFAULT_POINTER_ANGLE;
    const bottomLeft = polarToCartesian(
      150,
      150,
      100 - (this.pointerOffset ?? DEFAULT_POINTER_OFFSET),
      pA
    );
    const size = this.pointerSize ?? DEFAULT_POINTER_SIZE;
    const hsize = size / 2;
    fixedSvgHtml.push(
      `<image width="${size}" height="${size}" transform="translate(${
        bottomLeft.x - hsize
      } ${
        bottomLeft.y - hsize
      }) rotate(${pA}, ${hsize}, ${hsize})" href="${pointer}" />`
    );
    svgFixed.innerHTML = fixedSvgHtml.join("\r\n");
    if (fixedSvgHtml.length > 0) {
      wheelFixed.appendChild(svgFixed);
    }
  }

  #generateLogo(svgContents: string[]) {
    if (this.logoImage) {
      const size = this.logoSize || DEFAULT_LOGO_SIZE;
      const halfSize = size / 2;
      svgContents.push(
        `<image width="${size}" height="${size}" x="${150 - halfSize}" y="${
          150 - halfSize
        }" href="${this.logoImage}" />`
      );
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
    if (this.onWheelStopped && this.segments && this.segments.length > 1) {
      const angleWidth = 360 / this.segments.length;
      const pA = this.pointerAngle ?? DEFAULT_POINTER_ANGLE;
      const index = Math.floor(
        (((r + angleWidth - pA) % 360) / 360) * this.segments.length
      );
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
