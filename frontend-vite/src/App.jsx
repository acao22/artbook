import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

function ExplorePage() {
  return <div className="p-10 text-black">Explore Page</div>;
}

function CollectionsPage() {
  return <div className="p-10 text-black">Collections Page</div>;
}

function NotesPage() {
  return <div className="p-10 text-black">Notes Page</div>;
}

export default function App() {
  return (
    <Router>
      <Navbar searchQuery="" onSearchChange={() => {}} />

      <Routes>
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="*" element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}
