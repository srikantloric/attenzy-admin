import { db } from "@/contexts/FirebaseContext";
import { doc, runTransaction } from "firebase/firestore";

export async function generateDeviceId(): Promise<string> {
  const ref = doc(db, "counters", "devices");

  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists()) {
      throw new Error("Device counter not found");
    }

    const current = snap.data().current as number;
    const value = current + 1;

    tx.update(ref, { current: value });
    return value;
  });

  return `DEV-${String(next).padStart(4, "0")}`;
}
