export interface SegmentDescription<V> {
  backgroundColor: string;
  textColor: string;
  text: string;
  value: V;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["wheel-component"]: {
        segments: SegmentDescription<string>[];
        onchange: (value: string) => void;
        spin: () => void;
      };
    }
  }
}

const css = `
 div.root {
  width: 300px;
  height: 300px;
  box-sizing: border-box;
  display: block;
 }

 svg {
  width: 300px;
  height: 300px;
 }
`;

export class WheelComponent<V> extends HTMLElement {
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
  }

  static get observedAttributes() {
    return ["segments"];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.innerHTML = css;
    shadow.appendChild(style);

    const root = document.createElement("div");
    root.classList.add("root");
    root.innerHTML = `Hello World`;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    root.appendChild(svg);

    svg.onclick = this.handleClick.bind(this);

    const path = `<path id="arc2" fill="red" stroke="#446688" stroke-width="0" d="${describeArc(
      150,
      150,
      100,
      30,
      70
    )}" />`;
    svg.innerHTML = path;
    shadow.appendChild(root);
    this.#parseAttributes();
  }

  async handleClick() {
    const svg = this.shadowRoot?.querySelector("div.root") as HTMLElement;
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
  }

  attributeChangedCallback(...args: any[]) {
    console.log("Attribute changed", ...args);
    this.#parseAttributes();
  }

  #parseAttributes() {
    try {
      const str = this.getAttribute("segments");
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
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

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
  var center = polarToCartesian(x, y, radius, 0);
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

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

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

window.customElements.define("wheel-component", WheelComponent);
