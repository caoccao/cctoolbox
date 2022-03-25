'''
  Copyright (c) 2021-2022 caoccao.com Sam Cao
  All rights reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
'''

import argparse
import coloredlogs
import logging
import pywintypes
import sys
import time
import win32api
import win32gui

coloredlogs.install(level=logging.DEBUG, fmt='%(asctime)-15s %(name)s %(levelname)s: %(message)s')

class HideVolumeOSD(object):

  def __init__(self) -> None:
    self._parse_args()

  def _parse_args(self) -> None:
    parser = argparse.ArgumentParser(
      description='arguments for hiding/showing the volume OSD',
    )
    parser.add_argument('--show',
      action='store_true',
      help='show the volume OSD')
    parser.add_argument('--hide',
      action='store_true',
      help='hide the volume OSD')
    args = parser.parse_args()
    self._hide = not args.show

  def _adjust_volume(self):
    win32api.keybd_event(175, 0, 0, 0) # VolumeUp
    win32api.keybd_event(174, 0, 0, 0) # VolumeDown

  def _find_osd_handle(self):
    logging.info('Finding the volume OSD window.')
    parent_handle = pywintypes.HANDLE()
    zero_handle = pywintypes.HANDLE()
    while True:
      parent_handle = win32gui.FindWindowEx(parent_handle, zero_handle, 'NativeHWNDHost', '')
      if parent_handle != 0:
        child_handle = win32gui.FindWindowEx(parent_handle, zero_handle, 'DirectUIHWND', '')
        if child_handle != 0:
          return parent_handle
      else:
        break
    return None

  def run(self) -> int:
    osd_handle = self._find_osd_handle()
    if osd_handle == 0:
      for i in range(10):
        self._adjust_volume()
        osd_handle = self._find_osd_handle()
        if osd_handle == 0:
          break
        logging.warn('The volume OSD window is not found.')
        if i < 9:
          logging.warn('Sleep a while.')
          time.sleep(1)
    if osd_handle == 0:
      logging.error('The volume OSD window is not found.')
      return 1
    if self._hide:
      logging.info('Hiding the volume OSD window.')
      win32gui.ShowWindow(osd_handle, 6)
    else:
      logging.info('Showing the volume OSD window.')
      win32gui.ShowWindow(osd_handle, 9)
      self._adjust_volume()
    return 0

def main():
  return HideVolumeOSD().run()

if __name__ == '__main__':
  sys.exit(int(main() or 0))
