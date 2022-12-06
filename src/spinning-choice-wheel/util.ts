export function polarToCartesian(
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

export function describeArc(
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
    "Z",
  ].join(" ");

  return d;
}

export function describeRotatedText(
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  const translate = `translate(${radius + cx}, ${cy})`;
  const rotate = `rotate(${angle - 90}, ${cx}, ${cy})`;

  return ` text-anchor="middle" dominant-baseline="central" transform="${rotate} ${translate}" `;
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function logError(cb: () => any, errorMessage?: string) {
  try {
    return cb();
  } catch (err) {
    console.error(errorMessage || "Error", err);
  }
}

export function toKebabCase(text: string) {
  return text
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}
