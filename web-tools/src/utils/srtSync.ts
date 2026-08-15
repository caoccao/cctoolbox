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
import { SrtLine, SrtLineType, SrtMarker, Velocity } from '../types/srt';
import { srtTimeToMillis } from './srtParser';

/**
 * A pair of times driving the sync: the lines at `from` are moved to `to`.
 */
export interface SyncAnchor {
  from: number;
  to: number;
}

const isValidTime = (millis: number | null): millis is number =>
  millis !== null && !Number.isNaN(millis);

/**
 * The start time a marker is synced to.
 *
 * In single file mode the right side only exists once the start time has been
 * edited, so a marker that has just been created (or that holds an unparsable
 * value) simply anchors its line at the current position.
 */
const getMarkerToStart = (marker: SrtMarker, isSingleFileMode: boolean): number | null => {
  if (marker.right && isValidTime(marker.right.getStart())) {
    return marker.right.getStart();
  }
  if (isSingleFileMode && marker.left) {
    const millis = marker.value === null ? NaN : srtTimeToMillis(marker.value);
    return isValidTime(millis) ? millis : marker.left.getStart();
  }
  return null;
};

/**
 * Turns the markers into the anchors that drive the sync, in ascending source
 * time order. Markers that are still missing an end are ignored.
 */
export const getSyncAnchors = (
  srtMarkers: SrtMarker[],
  isSingleFileMode: boolean,
  type: SrtLineType
): SyncAnchor[] => {
  const anchors: SyncAnchor[] = [];
  srtMarkers.forEach((marker) => {
    const leftStart = marker.left ? marker.left.getStart() : null;
    const toStart = getMarkerToStart(marker, isSingleFileMode);
    if (!isValidTime(leftStart) || !isValidTime(toStart)) {
      return;
    }
    anchors.push(
      type === SrtLineType.Left || isSingleFileMode
        ? { from: leftStart, to: toStart }
        : { from: toStart, to: leftStart }
    );
  });
  return anchors.sort((a, b) => a.from - b.from);
};

/**
 * Clones the lines and moves them along the anchors. A single anchor shifts
 * every line by the same amount, more anchors interpolate the shift between
 * them.
 */
export const shiftSrtLines = (srtLines: SrtLine[], anchors: SyncAnchor[]): SrtLine[] => {
  if (anchors.length == 0) {
    return srtLines;
  }
  if (anchors.length == 1) {
    const diffTime = anchors[0].to - anchors[0].from;
    return srtLines.map((srtLine) => srtLine.toClone().shiftTime(diffTime));
  }
  const velocities: Velocity[] = [];
  for (let i = 0; i < anchors.length - 1; ++i) {
    velocities.push(
      new Velocity(
        anchors[i].to - anchors[i].from,
        anchors[i + 1].to - anchors[i + 1].from,
        anchors[i].from,
        anchors[i + 1].from
      )
    );
  }
  return srtLines.map((srtLine) => {
    const clone = srtLine.toClone();
    const start = clone.getStart();
    let velocityIndex = 0;
    let velocity = velocities[velocityIndex];
    while (start > velocity.timeTo && velocityIndex < velocities.length - 1) {
      ++velocityIndex;
      velocity = velocities[velocityIndex];
    }
    if (
      (velocityIndex == 0 && start < velocity.timeFrom) ||
      (velocityIndex == velocities.length - 1 && start > velocity.timeTo) ||
      (start >= velocity.timeFrom && start <= velocity.timeTo)
    ) {
      clone.shiftTime(
        velocity.diffFrom +
          ((velocity.diffTo - velocity.diffFrom) * (start - velocity.timeFrom)) /
            (velocity.timeTo - velocity.timeFrom)
      );
    } else {
      console.warn('Ignore', clone);
    }
    return clone;
  });
};
