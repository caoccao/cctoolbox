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
import { millisToSrtTime, srtTimeToMillis } from '../utils/srtParser';

export enum SrtLineType {
  Left,
  Right
}

export class SrtLine {
  private index: number;
  private markerIndex: number;
  private start: number;
  private end: number;
  private text: string;
  private type: SrtLineType;

  constructor(index: number, type: SrtLineType) {
    this.index = index;
    this.markerIndex = -1;
    this.start = -1;
    this.end = -1;
    this.text = '';
    this.type = type;
  }

  getEnd() {
    return this.end;
  }

  getEndText(pointChar: string = ',') {
    return millisToSrtTime(this.end, pointChar);
  }

  getIndex() {
    return this.index;
  }

  getMarkerIndex() {
    return this.markerIndex;
  }

  getStart() {
    return this.start;
  }

  getStartText(pointChar: string = ',') {
    return millisToSrtTime(this.start, pointChar);
  }

  getText() {
    return this.text;
  }

  getType() {
    return this.type;
  }

  setEnd(millis: number): SrtLine {
    this.end = millis;
    return this;
  }

  setEndText(text: string): SrtLine {
    this.end = srtTimeToMillis(text);
    return this;
  }

  setIndex(index: number): SrtLine {
    this.index = index;
    return this;
  }

  setMarkerIndex(markerIndex: number): SrtLine {
    this.markerIndex = markerIndex;
    return this;
  }

  setStart(millis: number): SrtLine {
    this.start = millis;
    return this;
  }

  setStartText(text: string): SrtLine {
    this.start = srtTimeToMillis(text);
    return this;
  }

  setText(text: string): SrtLine {
    this.text = text;
    return this;
  }

  setType(type: SrtLineType): SrtLine {
    this.type = type;
    return this;
  }

  shiftTime(diffTime: number): SrtLine {
    this.start += diffTime;
    this.end += diffTime;
    return this;
  }

  toClone() {
    return new SrtLine(this.index, this.type)
      .setIndex(this.index)
      .setMarkerIndex(this.markerIndex)
      .setText(this.text)
      .setEnd(this.end)
      .setStart(this.start);
  }

  toString() {
    return `${this.index}\n${this.getStartText()} --> ${this.getEndText()}\n${this.text}\n`;
  }
}

export class SrtMarker {
  left: SrtLine | null;
  right: SrtLine | null;

  constructor() {
    this.left = null;
    this.right = null;
  }

  clear() {
    this.setMarkerIndex(-1);
  }

  setMarkerIndex(index: number) {
    if (this.left) {
      this.left.setMarkerIndex(index);
    }
    if (this.right) {
      this.right.setMarkerIndex(index);
    }
  }
}

export class Velocity {
  diffFrom: number;
  diffTo: number;
  timeFrom: number;
  timeTo: number;

  constructor(diffFrom: number, diffTo: number, timeFrom: number, timeTo: number) {
    this.diffFrom = diffFrom;
    this.diffTo = diffTo;
    this.timeFrom = timeFrom;
    this.timeTo = timeTo;
  }
}
