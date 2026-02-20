import { create } from "zustand";

export const useAppStore = create((set) => ({
  apiBase: import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api/v1",
  apiKey: import.meta.env.VITE_API_KEY ?? "change-me",
  role: "owner",
  userId: "",
  sessionToken: "",
  ownerForm: {
    petId: "",
    ownerId: "",
    bookingId: "",
  },
  setRole: (role) => set({ role }),
  setUserId: (userId) => set({ userId }),
  setSessionToken: (sessionToken) => set({ sessionToken }),
  setOwnerFormField: (key, value) =>
    set((state) => ({
      ownerForm: { ...state.ownerForm, [key]: value },
    })),
}));
