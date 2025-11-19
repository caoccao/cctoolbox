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
import { createContext, useContext, useState, ReactNode } from 'react';
import { SrtLine, SrtMarker } from '../types/srt';

export interface GrepItState {
  caseSensitiveChecked: boolean;
  multilineChecked: boolean;
  removeDuplicatedChecked: boolean;
  sortChecked: boolean;
  changeTemplateValue: string;
  inputValue: string;
  patternValue: string;
  templateValue: string;
  errorMessageCode: string;
  errorMessageInput: string;
}

export interface SrtSyncState {
  isDirty: boolean;
  isSingleFileMode: boolean;
  srtMarkers: SrtMarker[];
  originalLeftSrtLines: SrtLine[];
  originalRightSrtLines: SrtLine[];
  leftSrtLines: SrtLine[];
  rightSrtLines: SrtLine[];
}

interface TabStateContextType {
  // GrepIt state
  grepItState: GrepItState;
  setGrepItState: (state: GrepItState | ((prev: GrepItState) => GrepItState)) => void;

  // SrtSync state
  srtSyncState: SrtSyncState;
  setSrtSyncState: (state: SrtSyncState | ((prev: SrtSyncState) => SrtSyncState)) => void;

  // Base64 state
  base64DecodeInput: string;
  setBase64DecodeInput: (value: string) => void;
  base64EncodeInput: string;
  setBase64EncodeInput: (value: string) => void;
}

const TabStateContext = createContext<TabStateContextType | undefined>(undefined);

const initialGrepItState: GrepItState = {
  caseSensitiveChecked: false,
  multilineChecked: false,
  removeDuplicatedChecked: false,
  sortChecked: false,
  changeTemplateValue: '_',
  inputValue: '',
  patternValue: '[^\\r\\n]+',
  templateValue: '',
  errorMessageCode: '',
  errorMessageInput: ''
};

const initialSrtSyncState: SrtSyncState = {
  isDirty: false,
  isSingleFileMode: true,
  srtMarkers: [],
  originalLeftSrtLines: [],
  originalRightSrtLines: [],
  leftSrtLines: [],
  rightSrtLines: []
};

export const TabStateProvider = ({ children }: { children: ReactNode }) => {
  const [grepItState, setGrepItState] = useState<GrepItState>(initialGrepItState);
  const [srtSyncState, setSrtSyncState] = useState<SrtSyncState>(initialSrtSyncState);
  const [base64DecodeInput, setBase64DecodeInput] = useState('');
  const [base64EncodeInput, setBase64EncodeInput] = useState('');

  return (
    <TabStateContext.Provider
      value={{
        grepItState,
        setGrepItState,
        srtSyncState,
        setSrtSyncState,
        base64DecodeInput,
        setBase64DecodeInput,
        base64EncodeInput,
        setBase64EncodeInput
      }}
    >
      {children}
    </TabStateContext.Provider>
  );
};

export const useTabState = () => {
  const context = useContext(TabStateContext);
  if (context === undefined) {
    throw new Error('useTabState must be used within a TabStateProvider');
  }
  return context;
};
