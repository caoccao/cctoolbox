/*
 *   Copyright (c) 2024-2025. caoccao.com Sam Cao
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { describe, expect, it } from 'vitest';
import { SrtLine, SrtLineType, SrtMarker } from '../types/srt';
import { getSyncAnchors, shiftSrtLines } from './srtSync';

const newSrtLine = (index: number, type: SrtLineType, start: number): SrtLine =>
  new SrtLine(index, type)
    .setStart(start)
    .setEnd(start + 1000)
    .setText(`Line ${index}`);

/** A marker created by Ctrl + Click in single file mode, start time untouched. */
const newSingleFileMarker = (srtLine: SrtLine): SrtMarker => {
  const marker = new SrtMarker();
  marker.left = srtLine;
  marker.value = srtLine.getStartText('.');
  return marker;
};

const newEditedSingleFileMarker = (srtLine: SrtLine, value: string): SrtMarker => {
  const marker = newSingleFileMarker(srtLine);
  marker.value = value;
  marker.right = new SrtLine(srtLine.getIndex(), SrtLineType.Right).setStartText(value);
  return marker;
};

describe('getSyncAnchors', () => {
  it('anchors an unedited single file marker at its current position', () => {
    const marker = newSingleFileMarker(newSrtLine(1, SrtLineType.Left, 10000));
    const anchors = getSyncAnchors([marker], true, SrtLineType.Right);
    expect(anchors).toEqual([{ from: 10000, to: 10000 }]);
  });

  it('anchors an unedited single file marker holding an unparsable value', () => {
    const marker = newSingleFileMarker(newSrtLine(1, SrtLineType.Left, 10000));
    marker.value = 'not a time';
    const anchors = getSyncAnchors([marker], true, SrtLineType.Right);
    expect(anchors).toEqual([{ from: 10000, to: 10000 }]);
  });

  it('takes the edited start time of a single file marker', () => {
    const marker = newEditedSingleFileMarker(
      newSrtLine(1, SrtLineType.Left, 10000),
      '00:00:12.500'
    );
    const anchors = getSyncAnchors([marker], true, SrtLineType.Right);
    expect(anchors).toEqual([{ from: 10000, to: 12500 }]);
  });

  it('sorts the anchors by source time', () => {
    const anchors = getSyncAnchors(
      [
        newEditedSingleFileMarker(newSrtLine(2, SrtLineType.Left, 20000), '00:00:22.000'),
        newSingleFileMarker(newSrtLine(1, SrtLineType.Left, 10000))
      ],
      true,
      SrtLineType.Right
    );
    expect(anchors).toEqual([
      { from: 10000, to: 10000 },
      { from: 20000, to: 22000 }
    ]);
  });

  it('skips incomplete markers in dual file mode', () => {
    const halfMarker = new SrtMarker();
    halfMarker.left = newSrtLine(1, SrtLineType.Left, 10000);
    const marker = new SrtMarker();
    marker.left = newSrtLine(2, SrtLineType.Left, 20000);
    marker.right = newSrtLine(2, SrtLineType.Right, 25000);
    expect(getSyncAnchors([halfMarker, marker], false, SrtLineType.Left)).toEqual([
      { from: 20000, to: 25000 }
    ]);
    expect(getSyncAnchors([halfMarker, marker], false, SrtLineType.Right)).toEqual([
      { from: 25000, to: 20000 }
    ]);
  });
});

describe('shiftSrtLines', () => {
  it('returns the lines untouched without anchors', () => {
    const srtLines = [newSrtLine(1, SrtLineType.Left, 10000)];
    expect(shiftSrtLines(srtLines, [])).toBe(srtLines);
  });

  it('shifts every line by the same amount with one anchor', () => {
    const srtLines = [
      newSrtLine(1, SrtLineType.Left, 10000),
      newSrtLine(2, SrtLineType.Left, 20000)
    ];
    const shifted = shiftSrtLines(srtLines, [{ from: 10000, to: 12000 }]);
    expect(shifted.map((srtLine) => srtLine.getStart())).toEqual([12000, 22000]);
    expect(shifted.map((srtLine) => srtLine.getEnd())).toEqual([13000, 23000]);
    expect(srtLines.map((srtLine) => srtLine.getStart())).toEqual([10000, 20000]);
  });

  it('keeps the lines in place when the anchors do not move', () => {
    const srtLines = [
      newSrtLine(1, SrtLineType.Left, 10000),
      newSrtLine(2, SrtLineType.Left, 15000),
      newSrtLine(3, SrtLineType.Left, 20000)
    ];
    const shifted = shiftSrtLines(srtLines, [
      { from: 10000, to: 10000 },
      { from: 20000, to: 20000 }
    ]);
    expect(shifted.map((srtLine) => srtLine.getStart())).toEqual([10000, 15000, 20000]);
  });

  it('interpolates the shift between the anchors', () => {
    const srtLines = [
      newSrtLine(1, SrtLineType.Left, 10000),
      newSrtLine(2, SrtLineType.Left, 15000),
      newSrtLine(3, SrtLineType.Left, 20000)
    ];
    const shifted = shiftSrtLines(srtLines, [
      { from: 10000, to: 10000 },
      { from: 20000, to: 22000 }
    ]);
    expect(shifted.map((srtLine) => srtLine.getStart())).toEqual([10000, 16000, 22000]);
  });

  it('extrapolates the lines outside of the anchors', () => {
    const srtLines = [
      newSrtLine(1, SrtLineType.Left, 5000),
      newSrtLine(2, SrtLineType.Left, 25000)
    ];
    const shifted = shiftSrtLines(srtLines, [
      { from: 10000, to: 10000 },
      { from: 20000, to: 22000 }
    ]);
    expect(shifted.map((srtLine) => srtLine.getStart())).toEqual([4000, 28000]);
  });
});
