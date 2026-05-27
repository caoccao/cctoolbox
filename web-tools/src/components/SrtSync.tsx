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
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { SrtLine, SrtMarker, SrtLineType, Velocity } from '../types/srt';
import { srtTextToSrtLines } from '../utils/srtParser';
import { useTabState } from '../contexts/TabStateContext';

const SrtSync = () => {
  const { srtSyncState, setSrtSyncState } = useTabState();

  // Destructure persisted state
  const {
    isDirty,
    isSingleFileMode,
    srtMarkers,
    originalLeftSrtLines,
    originalRightSrtLines,
    leftSrtLines,
    rightSrtLines
  } = srtSyncState;

  // Helper functions to update persisted state
  const setIsDirty = (value: boolean) => setSrtSyncState((prev) => ({ ...prev, isDirty: value }));
  const setIsSingleFileMode = (value: boolean) =>
    setSrtSyncState((prev) => ({ ...prev, isSingleFileMode: value }));
  const setSrtMarkers = (value: SrtMarker[]) =>
    setSrtSyncState((prev) => ({ ...prev, srtMarkers: value }));
  const setOriginalLeftSrtLines = (value: SrtLine[]) =>
    setSrtSyncState((prev) => ({ ...prev, originalLeftSrtLines: value }));
  const setOriginalRightSrtLines = (value: SrtLine[]) =>
    setSrtSyncState((prev) => ({ ...prev, originalRightSrtLines: value }));
  const setLeftSrtLines = (value: SrtLine[]) =>
    setSrtSyncState((prev) => ({ ...prev, leftSrtLines: value }));
  const setRightSrtLines = (value: SrtLine[]) =>
    setSrtSyncState((prev) => ({ ...prev, rightSrtLines: value }));

  const onChangeTextField = (event: React.ChangeEvent<HTMLInputElement>, srtLine: SrtLine) => {
    const newSrtMarkers = [...srtMarkers];
    const newSrtMarker = newSrtMarkers[srtLine.getMarkerIndex()];
    newSrtMarker.value = event.target.value;
    setSrtMarkers(newSrtMarkers);
    setIsDirty(true);
  };

  function onBlurTextField(srtLine: SrtLine): void {
    const newSrtMarkers = [...srtMarkers];
    const newSrtMarker = newSrtMarkers[srtLine.getMarkerIndex()];
    newSrtMarker.right = new SrtLine(srtLine.getIndex(), SrtLineType.Right).setStartText(
      newSrtMarker.value ?? srtLine.getStartText('.')
    );
    setSrtMarkers(newSrtMarkers);
    setIsDirty(true);
  }

  function onKeyUpTextField(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  }

  const onClickLeftCopy = () => {
    navigator.clipboard.writeText(leftSrtLines.map((srtLine) => srtLine.toString()).join('\n'));
  };

  const onClickLeftPaste = () => {
    navigator.clipboard.readText().then((text) => {
      const lines = srtTextToSrtLines(text, SrtLineType.Left);
      setLeftSrtLines(lines);
      setOriginalLeftSrtLines(lines.map((srtLine) => srtLine.toClone()));
      if (isSingleFileMode) {
        setRightSrtLines([]);
        setOriginalRightSrtLines([]);
      }
      setSrtMarkers([]);
    });
  };

  const onClickLeftRenumber = () => {
    leftSrtLines.forEach((srtLine, index) => {
      srtLine.setIndex(index + 1);
    });
    setLeftSrtLines([...leftSrtLines]);
    setIsDirty(true);
  };

  const onClickMarker = (srtLine: SrtLine) => {
    let markers = [...srtMarkers];
    if (srtLine.getMarkerIndex() >= 0) {
      const markerIndex = srtLine.getMarkerIndex();
      markers[markerIndex].clear();
      markers = markers.filter((_marker, i) => i !== markerIndex);
    } else {
      if (srtLine.getType() === SrtLineType.Left) {
        const found = markers.find((marker, i) => {
          if (marker.left === null) {
            srtLine.setMarkerIndex(i);
            marker.left = srtLine;
            return true;
          }
          return false;
        });
        if (!found) {
          const marker = new SrtMarker();
          marker.left = srtLine;
          marker.value = srtLine.getStartText('.');
          markers.push(marker);
        }
      } else {
        const found = markers.find((marker, i) => {
          if (marker.right === null) {
            srtLine.setMarkerIndex(i);
            marker.right = srtLine;
            return true;
          }
          return false;
        });
        if (!found) {
          const marker = new SrtMarker();
          marker.right = srtLine;
          marker.value = srtLine.getStartText('.');
          markers.push(marker);
        }
      }
    }
    markers
      .sort((a, b) => {
        if (a.left && b.left) {
          return a.left.getStart() - b.left.getStart();
        }
        if (a.left) {
          return -1;
        }
        if (b.left) {
          return 1;
        }
        return 0;
      })
      .forEach((marker, i) => {
        marker.setMarkerIndex(i);
      });
    setSrtMarkers(markers);
    setLeftSrtLines([...leftSrtLines]);
    setRightSrtLines([...rightSrtLines]);
    setIsDirty(true);
  };

  const onClickReset = () => {
    setSrtMarkers([]);
    setLeftSrtLines(originalLeftSrtLines.map((srtLine) => srtLine.toClone()));
    if (isSingleFileMode) {
      setRightSrtLines([]);
    } else {
      setRightSrtLines(originalRightSrtLines.map((srtLine) => srtLine.toClone()));
    }
    setIsDirty(false);
  };

  const onClickRightCopy = () => {
    navigator.clipboard.writeText(rightSrtLines.map((srtLine) => srtLine.toString()).join('\n'));
  };

  const onClickRightPaste = () => {
    navigator.clipboard.readText().then((text) => {
      const lines = srtTextToSrtLines(text, SrtLineType.Right);
      setRightSrtLines(lines);
      setOriginalRightSrtLines(lines.map((srtLine) => srtLine.toClone()));
      setSrtMarkers([]);
    });
  };

  const onClickRightRenumber = () => {
    rightSrtLines.forEach((srtLine, index) => {
      srtLine.setIndex(index + 1);
    });
    setRightSrtLines([...rightSrtLines]);
    setIsDirty(true);
  };

  const onClickSingleFileMode = () => {
    setIsSingleFileMode(!isSingleFileMode);
    setRightSrtLines([]);
    setSrtMarkers([]);
  };

  const onClickSyncToLeft = () => {
    sync(SrtLineType.Left);
    setIsDirty(true);
  };

  const onClickSyncToRight = () => {
    sync(SrtLineType.Right);
    setIsDirty(true);
  };

  const sync = (type: SrtLineType) => {
    setSrtSyncState((prev) => {
      const { srtMarkers, isSingleFileMode, leftSrtLines, rightSrtLines } = prev;
      const length = srtMarkers.length;

      let newLeftSrtLines = leftSrtLines;
      let newRightSrtLines = rightSrtLines;

      if (isSingleFileMode) {
        newRightSrtLines = leftSrtLines.map((srtLine) =>
          srtLine.toClone().setType(SrtLineType.Right)
        );
      }

      if (length == 1) {
        if (type === SrtLineType.Left) {
          const diffTime = srtMarkers[0].right!.getStart() - srtMarkers[0].left!.getStart();
          newLeftSrtLines = leftSrtLines.map((srtLine) => {
            const clone = srtLine.toClone();
            clone.shiftTime(diffTime);
            return clone;
          });
        } else {
          const diffTime = isSingleFileMode
            ? srtMarkers[0].right!.getStart() - srtMarkers[0].left!.getStart()
            : srtMarkers[0].left!.getStart() - srtMarkers[0].right!.getStart();
          newRightSrtLines = newRightSrtLines.map((srtLine) => {
            const clone = srtLine.toClone();
            clone.shiftTime(diffTime);
            return clone;
          });
        }
      } else if (length > 1) {
        if (type === SrtLineType.Left) {
          const velocities: Velocity[] = [];
          for (let i = 0; i < length - 1; ++i) {
            velocities.push(
              new Velocity(
                srtMarkers[i].right!.getStart() - srtMarkers[i].left!.getStart(),
                srtMarkers[i + 1].right!.getStart() - srtMarkers[i + 1].left!.getStart(),
                srtMarkers[i].left!.getStart(),
                srtMarkers[i + 1].left!.getStart()
              )
            );
          }
          newLeftSrtLines = leftSrtLines.map((srtLine) => {
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
        } else {
          const velocities: Velocity[] = [];
          for (let i = 0; i < length - 1; ++i) {
            velocities.push(
              isSingleFileMode
                ? new Velocity(
                    srtMarkers[i].right!.getStart() - srtMarkers[i].left!.getStart(),
                    srtMarkers[i + 1].right!.getStart() - srtMarkers[i + 1].left!.getStart(),
                    srtMarkers[i].left!.getStart(),
                    srtMarkers[i + 1].left!.getStart()
                  )
                : new Velocity(
                    srtMarkers[i].left!.getStart() - srtMarkers[i].right!.getStart(),
                    srtMarkers[i + 1].left!.getStart() - srtMarkers[i + 1].right!.getStart(),
                    srtMarkers[i].right!.getStart(),
                    srtMarkers[i + 1].right!.getStart()
                  )
            );
          }
          newRightSrtLines = newRightSrtLines.map((srtLine) => {
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
        }
      }

      return {
        ...prev,
        leftSrtLines: newLeftSrtLines,
        rightSrtLines: newRightSrtLines
      };
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="contained" onClick={onClickLeftPaste}>
            Paste
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onClickLeftCopy}
            disabled={leftSrtLines.length == 0}
          >
            Copy
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onClickLeftRenumber}
            disabled={leftSrtLines.length == 0}
          >
            Renumber
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onClickSyncToRight}
            disabled={srtMarkers.length == 0}
          >
            Sync ⇨
          </Button>
        </Box>
      </Grid>
      <Grid size={6}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          {!isSingleFileMode && (
            <Button size="small" variant="contained" onClick={onClickRightPaste}>
              Paste
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={onClickRightCopy}
            disabled={rightSrtLines.length == 0}
          >
            Copy
          </Button>
          {!isSingleFileMode && (
            <>
              <Button
                size="small"
                variant="contained"
                onClick={onClickRightRenumber}
                disabled={rightSrtLines.length == 0}
              >
                Renumber
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={onClickSyncToLeft}
                disabled={srtMarkers.length == 0}
              >
                ⇦ Sync
              </Button>
            </>
          )}
        </Box>
      </Grid>
      <Grid size={6}>
        <TableContainer sx={{ maxHeight: '80vh' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'lightblue',
                    width: '4em',
                    maxWidth: '4em'
                  }}
                >
                  Index
                </TableCell>
                <TableCell align="center" sx={{ backgroundColor: 'lightblue' }}>
                  Start
                </TableCell>
                <TableCell align="center" sx={{ backgroundColor: 'lightblue' }}>
                  End
                </TableCell>
                <TableCell align="left" sx={{ backgroundColor: 'lightblue' }}>
                  Text
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leftSrtLines.map((srtLine, index) => (
                <TableRow
                  key={index}
                  onClick={(event) => {
                    if (event.ctrlKey) {
                      onClickMarker(srtLine);
                    }
                  }}
                  sx={{
                    backgroundColor:
                      srtLine.getMarkerIndex() >= 0 && srtLine.getMarkerIndex() < srtMarkers.length
                        ? '#eeeeff'
                        : 'inherit',
                    '&:hover': {
                      backgroundColor: '#eeffee'
                    },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell align="center" sx={{ width: '4em', maxWidth: '4em' }}>
                    {srtLine.getMarkerIndex() >= 0 &&
                    srtLine.getMarkerIndex() < srtMarkers.length ? (
                      <Badge
                        badgeContent={srtLine.getMarkerIndex() + 1}
                        color="warning"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.75rem',
                            height: '18px',
                            minWidth: '18px'
                          }
                        }}
                      >
                        <Box component="span">{srtLine.getIndex()}</Box>
                      </Badge>
                    ) : (
                      srtLine.getIndex()
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                  >
                    {isSingleFileMode &&
                    srtLine.getMarkerIndex() >= 0 &&
                    srtLine.getMarkerIndex() < srtMarkers.length ? (
                      <TextField
                        size="small"
                        value={
                          srtMarkers[srtLine.getMarkerIndex()].value ?? srtLine.getStartText('.')
                        }
                        onChange={(event) =>
                          onChangeTextField(event as React.ChangeEvent<HTMLInputElement>, srtLine)
                        }
                        onBlur={() => onBlurTextField(srtLine)}
                        onKeyUp={onKeyUpTextField}
                        sx={{
                          '& input': {
                            textAlign: 'center',
                            fontFamily: '"Courier New", Courier, monospace',
                            fontSize: '14px'
                          }
                        }}
                      />
                    ) : (
                      srtLine.getStartText('.')
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                  >
                    {srtLine.getEndText('.')}
                  </TableCell>
                  <TableCell>{srtLine.getText()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid size={6}>
        <TableContainer sx={{ maxHeight: '80vh' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: 'lightblue',
                    width: '4em',
                    maxWidth: '4em'
                  }}
                >
                  Index
                </TableCell>
                <TableCell align="center" sx={{ backgroundColor: 'lightblue' }}>
                  Start
                </TableCell>
                <TableCell align="center" sx={{ backgroundColor: 'lightblue' }}>
                  End
                </TableCell>
                <TableCell align="left" sx={{ backgroundColor: 'lightblue' }}>
                  Text
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rightSrtLines.map((srtLine, index) => (
                <TableRow
                  key={index}
                  onClick={(event) => {
                    if (event.ctrlKey) {
                      onClickMarker(srtLine);
                    }
                  }}
                  sx={{
                    backgroundColor:
                      srtLine.getMarkerIndex() >= 0 && srtLine.getMarkerIndex() < srtMarkers.length
                        ? '#eeeeff'
                        : 'inherit',
                    '&:hover': {
                      backgroundColor: '#eeffee'
                    },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell align="center" sx={{ width: '4em', maxWidth: '4em' }}>
                    {srtLine.getMarkerIndex() >= 0 &&
                    srtLine.getMarkerIndex() < srtMarkers.length ? (
                      <Badge
                        badgeContent={srtLine.getMarkerIndex() + 1}
                        color="warning"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.5rem',
                            height: '12px',
                            minWidth: '12px'
                          }
                        }}
                      >
                        <Box component="span">{srtLine.getIndex()}</Box>
                      </Badge>
                    ) : (
                      srtLine.getIndex()
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                  >
                    {srtLine.getStartText('.')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                  >
                    {srtLine.getEndText('.')}
                  </TableCell>
                  <TableCell>{srtLine.getText()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {leftSrtLines.length == 0 && rightSrtLines.length == 0 && (
        <Grid size={12}>
          <Typography variant="h5" color="gray" align="center" sx={{ lineHeight: 1.5, pt: 2 }}>
            Paste the Srt file content.
          </Typography>
          <Typography variant="h5" color="gray" align="center" sx={{ lineHeight: 1.5, pb: 2 }}>
            Ctrl + Click to mark or unmark.
          </Typography>
        </Grid>
      )}
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={isSingleFileMode} onChange={onClickSingleFileMode} />}
            label="Single File Mode"
          />
          <Button size="small" variant="outlined" onClick={onClickReset} disabled={!isDirty}>
            Reset
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default SrtSync;
