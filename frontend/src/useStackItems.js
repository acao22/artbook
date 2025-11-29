import { useEffect, useState } from "react";
import { get, push, ref, set } from "firebase/database";
import { db } from "./firebaseClient";

export function useStackItems(userId) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");

  const addItem = async (payload) => {
    if (!userId) return;
    const newRef = push(ref(db, `users/${userId}/stacks`));
    await set(ref(db, `stacks/${newRef.key}`), payload);
    await set(ref(db, `users/${userId}/stacks/${newRef.key}`), true);
    setItems((prev) => [...prev, { id: newRef.key, ...payload }]);
  };

  useEffect(() => {
    if (!userId) return;

    async function fetchStacks() {
      setStatus("loading");
      try {
        const idsSnap = await get(ref(db, `users/${userId}/stacks`));
        const ids = idsSnap.val();
        if (!ids) {
          setItems([]);
          setStatus("success");
          return;
        }

        const hydrated = await Promise.all(
          Object.keys(ids).map(async (stackId) => {
            const stackSnap = await get(ref(db, `stacks/${stackId}`));
            const data = stackSnap.val() ?? {};
            return {
              id: stackId,
              title: data.title ?? "Untitled",
              type: data.mediaType ?? "other",
              img: data.coverUrl ?? "/fallback.png",
              hearted: !!data.hearted,
            };
          })
        );

        setItems(hydrated);
        setStatus("success");
      } catch (error) {
        console.error("Failed to load stacks", error);
        setStatus("error");
      }
    }

    fetchStacks();
  }, [userId]);

  return { items, status, addItem };
}