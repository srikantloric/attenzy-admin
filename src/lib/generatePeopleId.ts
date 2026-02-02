import { db } from "@/contexts/FirebaseContext";
import { doc, runTransaction } from "firebase/firestore";
import type { PeopleType } from "@/types/people";

export async function generatePeopleId(
  type: PeopleType
): Promise<number> {
  const counterRef = doc(db, "counters", type);

  return await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);

    if (!snapshot.exists()) {
      throw new Error(
        `Counter document not found: counters/${type}`
      );
    }

    const data = snapshot.data();

    if (typeof data.current !== "number") {
      throw new Error(
        `Invalid counter value for counters/${type}`
      );
    }

    const next = data.current + 1;
    transaction.update(counterRef, { current: next });

    return next;
  });
}
