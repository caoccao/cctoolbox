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
import { SrtLine, SrtLineType } from '../types/srt';

const SRT_LINE_SEPARATOR_PATTERN = /[\r\n]/;
const SRT_INDEX_PATTERN = /^\s*\d+\s*$/;
const SRT_TIME_PATTERN =
  /^\s*(-?)(\d{2}:\d{2}:\d{2},\d{3})\s*-{2}>\s*(-?)(\d{2}:\d{2}:\d{2},\d{3})\s*$/;

export const millisToSrtTime = (millis: number, pointChar: string = ',') => {
  millis = Math.round(millis);
  const sign = millis < 0 ? '-' : '';
  millis = Math.abs(millis);
  const millionSeconds = millis % 1000;
  const seconds = ((millis - millionSeconds) / 1000) % 60;
  const minutes = ((millis - millionSeconds - seconds * 1000) / 60000) % 60;
  const hours = (millis - millionSeconds - seconds * 1000 - minutes * 60000) / 3600000;
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}${pointChar}${millionSeconds.toString().padStart(3, '0')}`;
};

export const srtTimeToMillis = (srtTime: string) => {
  const times = srtTime.split(/[:,.]+/g);
  return (
    parseInt(times[0]) * 3600000 +
    parseInt(times[1]) * 60000 +
    parseInt(times[2]) * 1000 +
    parseInt(times[3])
  );
};

export const srtTextToSrtLines = (text: string | null, type: SrtLineType): SrtLine[] => {
  const srtLines: SrtLine[] = [];
  if (text) {
    text = text.replace(/\r/g, '');
    const lines = text.split(SRT_LINE_SEPARATOR_PATTERN);
    const length = lines.length;
    let srtLine: SrtLine | null = null;
    for (let i = 0; i < length; ++i) {
      const line = lines[i];
      const indexMatcher = line.match(SRT_INDEX_PATTERN);
      if (indexMatcher && i < length - 1) {
        ++i;
        const timeMatcher = lines[i].match(SRT_TIME_PATTERN);
        if (timeMatcher) {
          srtLine = new SrtLine(parseInt(indexMatcher[0]), type)
            .setStartText(timeMatcher[2])
            .setEndText(timeMatcher[4]);
          if (timeMatcher[1] === '-') {
            srtLine.setStart(-1 * srtLine.getStart());
          }
          if (timeMatcher[3] === '-') {
            srtLine.setEnd(-1 * srtLine.getEnd());
          }
          srtLines.push(srtLine);
        }
      } else if (srtLine) {
        srtLine.setText(srtLine.getText() + line + '\n');
      } else {
        console.warn(`Ignored line: ${line}`);
      }
    }
  }
  srtLines
    .sort((a, b) => a.getStart() - b.getStart())
    .forEach((srtLine) => {
      srtLine.setText(srtLine.getText().trimEnd());
    });
  return srtLines;
};
