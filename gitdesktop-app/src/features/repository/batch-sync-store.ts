import { create } from "zustand";

export type BatchMode = "fetch" | "pull";
export type BatchRequest = {
  mode: BatchMode;
  folder?: string;
  folderName?: string;
};

interface BatchSyncState {
  request: BatchRequest | null;
  sequence: number;
  open: boolean;
  running: boolean;
  show: (request: BatchRequest) => void;
  setOpen: (open: boolean) => void;
  setRunning: (running: boolean) => void;
}

export const useBatchSync = create<BatchSyncState>((set) => ({
  request: null,
  sequence: 0,
  open: false,
  running: false,
  show: (request) =>
    set((state) =>
      state.running
        ? { open: true }
        : { request, open: true, sequence: state.sequence + 1 },
    ),
  setOpen: (open) => set({ open }),
  setRunning: (running) => set({ running }),
}));
