export interface SegmentDescription<V> {
  backgroundColor: string;
  textColor: string;
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

interface WheelComponentAttributes<V> extends HTMLElement {
  ref: MutableRef<SpinningChoiceWheelComponent<V>>;
}

const css = `
:host(spinning-choice-wheel) {
  display: block;
  box-sizing: border-box;
  width: 300px;
  height: 300px;
}

 div.root, div.wheel {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: block;
  position: relative;
  overflow: hidden;
 }

 svg {
  width: 100%;
  height: 100%;
 }
`;

type SingleArgCallBack<V> = (value: V) => void;
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

  onwheelstopped?: (value: V) => void;

  #refInternal: MutableRef<SpinningChoiceWheelComponent<V>> = { current: this };
  get ref() {
    return this.#refInternal;
  }
  set ref(refObj: MutableRef<SpinningChoiceWheelComponent<V>>) {
    try {
      if (refObj) {
        this.#refInternal = refObj;
        refObj.current = this;
      }
    } catch (err) {
      console.error("Error while trying to set reference");
    }
  }

  static get observedAttributes() {
    return ["segments-json"];
  }

  constructor() {
    super();
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

    const wheel = document.createElement("div");
    wheel.classList.add("wheel");
    root.appendChild(wheel);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wheel.appendChild(svg);

    svg.onclick = this.handleClick.bind(this);
    svg.setAttribute("viewBox", "0 0 300 300");
    const angleWidth = 360 / this.segments.length;
    let currentAngle = 0;

    const paths = this.segments.map((segment, index) => {
      const path = `<path id="arc${index}" fill="${
        segment.backgroundColor
      }" stroke="#446688" stroke-width="0" d="${describeArc(
        150,
        150,
        100,
        currentAngle,
        currentAngle + angleWidth
      )}" /><text fill="${segment.textColor}" ${describeRotatedText(
        150,
        150,
        50,
        currentAngle + angleWidth / 2
      )}>${segment.text}</text>`;
      currentAngle += angleWidth;
      return path;
    });

    svg.innerHTML = paths.join("\r\n");
  }

  async handleClick() {
    const svg = this.shadowRoot?.querySelector("div.wheel") as HTMLElement;
    if (!svg) {
      return;
    }
    const revolutionsPerSecond = 3;
    const spinDuration = 5;
    svg.style.transition = `${spinDuration}s ease transform`;
    const r = Math.random() * 360;
    svg.style.transform = `rotate(${
      360 * revolutionsPerSecond * spinDuration + r
    }deg)`;
    await delay(spinDuration * 1000 + 100);
    svg.style.transition = "";
    svg.style.transform = `rotate(${r}deg)`;
    if (this.onwheelstopped) {
      this.onwheelstopped(r as any);
    }
  }

  attributeChangedCallback(...args: any[]) {
    console.log("Attribute changed", ...args);
    this.#parseAttributes();
  }

  #parseAttributes() {
    try {
      const str = this.getAttribute("segments-json");
      if (str) {
        const value = JSON.parse(str);
        this.segments = value;
      }
    } catch (err) {
      console.error("Failed to parse attribute: ", err);
    }
  }
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const center = polarToCartesian(x, y, radius, 0);
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
    "M",
    150,
    150,
    "",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");

  return d;
}

function describeRotatedText(
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  const translate = `translate(${radius + cx}, ${cy})`;
  const rotate = `rotate(${angle - 90}, ${cx}, ${cy})`;

  return ` text-anchor="middle" dominant-baseline="central" transform="${rotate} ${translate}" `;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

window.customElements.define(
  "spinning-choice-wheel",
  SpinningChoiceWheelComponent
);
