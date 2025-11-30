import React, { useEffect, useState } from "react";
import AddNoteModal from "../components/AddNoteModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // load existing notes
  useEffect(() => {
  async function loadNotes() {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/notes?userId=user_001");
      const data = await res.json();

      const formatted = data.results.map((note) => ({
        id: note.id,
        title: note.content.split(" — ")[0] || "",
        subtitle: note.content.includes(" — ")
          ? note.content.split(" — ")[1]
          : "",
        date: new Date(note.createdAt * 1000).toLocaleDateString(),
        mediaId: note.stackId || null,
      }));

      setNotes(formatted);
    } catch (err) {
      console.error(err);
    }
  }

  loadNotes();
}, []);

  // SAVE NOTE handler for AddNoteModal
  const handleSaveNote = (newNote) => {
    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Your Notes</h1>

        <Button
          onClick={() => setShowModal(true)}
          className="rounded-full bg-[#CAC444] text-black w-10 h-10 flex items-center justify-center"
        >
          <Plus size={22} />
        </Button>
      </div>

      {/* three col grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="break-inside-avoid p-4 rounded-xl bg-[#AEC7E0]/40 shadow-sm"
          >
            <h2 className="text-lg font-bold">{note.title}</h2>
            {note.subtitle && (
              <p className="text-sm italic opacity-80">{note.subtitle}</p>
            )}
            <p className="text-xs mt-3 opacity-70">{note.date}</p>

            {note.mediaImg && (
              <img
                src={note.mediaImg}
                className="w-full rounded-lg mt-3 shadow"
              />
            )}
          </div>
        ))}
      </div>

      {/* modal */}
      {showModal && (
        <AddNoteModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveNote}   // FICING BUG: THIS MUST BE PASSED
        />
      )}
    </div>
  );
}
