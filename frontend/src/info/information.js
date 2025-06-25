import { create } from "zustand";

export const useInfo = create((set) => ({
    VoteInfo: [],
    setVoteInfo: (VoteInfo) => set({ VoteInfo }),
  
    createVoteInfo: async (newVoteInfo) => {
      const { Votername, ID_type, ID_Number, ID_Photo } = newVoteInfo;
  
      if (!Votername || !ID_type || !ID_Number || !ID_Photo) {
        return { success: false, message: "Please fill all the fields" };
      }
  
      const formData = new FormData();
      formData.append("Votername", Votername);
      formData.append("ID_type", ID_type);
      formData.append("ID_Number", ID_Number);
      formData.append("ID_Photo", ID_Photo);
  
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          body: formData,
        });
  
        const data = await res.json();
  
        if (res.ok) {
          set((state) => ({
            VoteInfo: [...state.VoteInfo, data.data],
          }));
          return { success: true, message: "Voter info submitted successfully" };
        } else {
          return { success: false, message: data.message || "Submission failed" };
        }
      } catch (error) {
        console.error("Error submitting voter info:", error);
        return { success: false, message: "Server error" };
      }
    },
  }));
  