import {
  type CardSizes,
  getDistanceFromCenter,
  getPlacePositions,
  getPlaceWidths,
  getSlideLayouts,
} from './slider-layout';

const DESKTOP_SIZES: CardSizes = {
  small: 120,
  medium: 288,
  gap: 8,
};
const TABLET_SIZES: CardSizes = {
  small: 104,
  medium: 0,
  gap: 8,
};

describe('getPlaceWidths', () => {
  it('builds seven places on desktop, and the large card takes what is left', () => {
    expect(getPlaceWidths(1800, DESKTOP_SIZES)).toEqual([0, 120, 288, 952, 288, 120, 0]);
  });

  it('builds five places without medium cards', () => {
    expect(getPlaceWidths(1000, TABLET_SIZES)).toEqual([0, 104, 776, 104, 0]);
  });

  it('never gives the large card a negative width', () => {
    expect(getPlaceWidths(100, DESKTOP_SIZES)[3]).toBe(0);
  });
});

describe('getPlacePositions', () => {
  it('puts places one after another, with hidden places just outside the track', () => {
    const widths = [0, 120, 288, 952, 288, 120, 0];

    expect(getPlacePositions(widths, 8)).toEqual([-8, 0, 128, 424, 1384, 1680, 1808]);
  });
});

describe('getDistanceFromCenter', () => {
  it('counts neighbours on both sides', () => {
    expect(getDistanceFromCenter(4, 3, 9)).toBe(1);
    expect(getDistanceFromCenter(2, 3, 9)).toBe(-1);
  });

  it('goes the short way around the circle', () => {
    expect(getDistanceFromCenter(8, 0, 9)).toBe(-1);
    expect(getDistanceFromCenter(0, 8, 9)).toBe(1);
  });
});

describe('getSlideLayouts', () => {
  it('makes the center card the largest and shows its info', () => {
    const layouts = getSlideLayouts(9, 4, 1800, DESKTOP_SIZES);

    expect(layouts[4]).toEqual({ width: 952, x: 424, isHidden: false, showsInfo: true });
  });

  it('hides the far cards and shows no info on small cards', () => {
    const layouts = getSlideLayouts(9, 4, 1800, DESKTOP_SIZES);

    expect(layouts[0]?.isHidden).toBe(true);
    expect(layouts[2]?.showsInfo).toBe(false);
    expect(layouts.filter((layout) => !layout.isHidden)).toHaveLength(5);
  });
});
