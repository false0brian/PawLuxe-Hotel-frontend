import { create } from "zustand";

export const useAppStore = create((set) => ({
  apiBase: import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1",
  apiKey: import.meta.env.VITE_API_KEY ?? "change-me",
  role: "owner",
  userId: "",
  sessionToken: "",
  tab: "owner",
  ownerForm: {
    petId: "",
    ownerId: "",
    bookingId: "",
  },
  staffForm: {
    petId: "",
    bookingId: "",
    toZoneId: "",
    type: "feeding",
    value: "",
  },
  zoneFocus: {
    zoneId: "",
    cameraId: "",
    animalId: "",
  },
  setTab: (tab) => set({ tab }),
  setRole: (role) => set({ role }),
  setUserId: (userId) => set({ userId }),
  setSessionToken: (sessionToken) => set({ sessionToken }),
  setOwnerFormField: (key, value) =>
    set((state) => ({
      ownerForm: { ...state.ownerForm, [key]: value },
    })),
  setStaffFormField: (key, value) =>
    set((state) => ({
      staffForm: { ...state.staffForm, [key]: value },
    })),
  mergeStaffForm: (patch) =>
    set((state) => ({
      staffForm: { ...state.staffForm, ...patch },
    })),
  setZoneFocus: (patch) =>
    set((state) => ({
      zoneFocus: { ...state.zoneFocus, ...patch },
    })),
  clearZoneFocus: () =>
    set({
      zoneFocus: { zoneId: "", cameraId: "", animalId: "" },
    }),
}));
