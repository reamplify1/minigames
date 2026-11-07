export interface CardSizes {
  small: number;
  medium: number;
  gap: number;
}

export interface SlideLayout {
  width: number;
  x: number;
  isHidden: boolean;
  showsInfo: boolean;
}

const INFO_MIN_WIDTH: number = 288;

export function getPlaceWidths(trackWidth: number, sizes: CardSizes): number[] {
  const { small, medium, gap } = sizes;
  const hasMedium = medium > 0;

  const leftCards = hasMedium ? [small, medium] : [small];
  const rightCards = hasMedium ? [medium, small] : [small];

  const oneSideWidth = small + medium + gap * leftCards.length;
  const largeWidth = Math.max(trackWidth - oneSideWidth * 2, 0);

  return [0, ...leftCards, largeWidth, ...rightCards, 0];
}

export function getPlacePositions(widths: number[], gap: number): number[] {
  const positions: number[] = [];
  let x = -gap;

  for (const width of widths) {
    positions.push(x);
    x += width + gap;
  }

  return positions;
}

export function getDistanceFromCenter(
  cardIndex: number,
  centerIndex: number,
  total: number
): number {
  let distance = cardIndex - centerIndex;

  if (distance > total / 2) {
    distance -= total;
  }

  if (distance < -total / 2) {
    distance += total;
  }

  return distance;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getSlideLayouts(
  total: number,
  centerIndex: number,
  trackWidth: number,
  sizes: CardSizes
): SlideLayout[] {
  const widths = getPlaceWidths(trackWidth, sizes);
  const positions = getPlacePositions(widths, sizes.gap);
  const centerPlace = Math.floor(widths.length / 2);
  const lastPlace = widths.length - 1;

  return Array.from({ length: total }, (_: unknown, cardIndex: number): SlideLayout => {
    const distance = getDistanceFromCenter(cardIndex, centerIndex, total);
    const place = clamp(centerPlace + distance, 0, lastPlace);
    const width = widths[place] ?? 0;

    return {
      width,
      x: positions[place] ?? 0,
      isHidden: width === 0,
      showsInfo: width >= INFO_MIN_WIDTH,
    };
  });
}
