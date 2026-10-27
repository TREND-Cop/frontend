/**
 * Math utilities for InteractiveAreaChart
 * Implements Fritsch-Carlson Monotone Cubic Spline Interpolation
 * ensuring C1 continuity, zero overshoot below baseline, and no loops.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Computes a smooth SVG monotone cubic spline path string for the given points.
 * Returns an SVG path 'd' attribute string (e.g. "M x0 y0 C cp1x cp1y, cp2x cp2y, x1 y1 ...").
 */
export function getMonotoneCubicLinePath(points: Point[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  const n = points.length;
  const dxs: number[] = [];
  const dys: number[] = [];
  const slopes: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    dxs.push(dx);
    dys.push(dy);
    slopes.push(dx !== 0 ? dy / dx : 0);
  }

  // Initial tangents
  const tangents: number[] = new Array(n).fill(0);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];

  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0;
    } else {
      tangents[i] = (slopes[i - 1] + slopes[i]) / 2;
    }
  }

  // Fritsch-Carlson monotonicity check and scaling
  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i] / slopes[i];
      const beta = tangents[i + 1] / slopes[i];
      const s = alpha * alpha + beta * beta;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        tangents[i] = tau * alpha * slopes[i];
        tangents[i + 1] = tau * beta * slopes[i];
      }
    }
  }

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = p1.x - p0.x;
    const cp1x = p0.x + dx / 3;
    const cp1y = p0.y + (tangents[i] * dx) / 3;
    const cp2x = p1.x - dx / 3;
    const cp2y = p1.y - (tangents[i + 1] * dx) / 3;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }

  return path;
}

/**
 * Computes a closed area SVG path string from top curve down to baseline.
 */
export function getMonotoneCubicAreaPath(
  points: Point[],
  baselineY: number
): string {
  if (!points || points.length < 2) return '';

  const linePath = getMonotoneCubicLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

/**
 * Map data values to pixel coordinates on the chart canvas.
 */
export function computeChartCoordinates(
  values: number[],
  canvasWidth: number,
  plotHeight: number,
  paddingHorizontal: number,
  paddingTop: number,
  baselineY: number
): Point[] {
  if (!values || values.length === 0) return [];

  const n = values.length;
  if (n === 1) {
    return [{ x: canvasWidth / 2, y: baselineY - 40 }];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const usableHeight = baselineY - paddingTop;
  const availableWidth = canvasWidth - paddingHorizontal * 2;
  const stepX = availableWidth / (n - 1);

  return values.map((val, idx) => {
    const x = paddingHorizontal + idx * stepX;
    const norm = range === 0 ? 0.5 : (val - min) / range;
    // higher value means smaller y (towards top)
    const y = baselineY - norm * usableHeight;
    return { x, y };
  });
}
