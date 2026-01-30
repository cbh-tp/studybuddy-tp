import { useState } from 'react';
import TutorCard from '../components/TutorCard';

function Home({ tutors }) {

  // --- STATIC DATA ---
  // A hardcoded list of available modules for the dropdown filter.
  // In a larger app, you might fetch this from the database too.
  const modules = [
    { code: "CIT2C20", name: "Full Stack Web Development" },
    { code: "CIT2C21", name: "Software Engineering" },
    { code: "CIT2C22", name: "Database Management" }
  ];

  // --- STATE MANAGEMENT ---
  // Stores the current value of the "Module Dropdown"
  const [selectedModule, setSelectedModule] = useState("");

  // Stores the current text typed into the "Search Bar"
  const [topicSearch, setTopicSearch] = useState("");

  // --- FILTERING LOGIC ---
  // This runs automatically whenever 'tutors', 'selectedModule', or 'topicSearch' changes.
  // It creates a new list (filteredTutors) that contains only the matches.
  const filteredTutors = tutors.filter((tutor) => {

    // 1. MODULE FILTER:
    // If a module is selected, check if the tutor teaches it.
    // If no module is selected (""), return 'true' (allow everyone).
    const matchesModule = selectedModule
      ? tutor.modules.includes(selectedModule)
      : true;

    // 2. TEXT SEARCH FILTER:
    // Check if the search text appears in the Tutor's Name OR their Topics.
    // We convert everything to .toLowerCase() to make it case-insensitive.
    const term = topicSearch.toLowerCase();

    const matchesSearch = topicSearch
      ? (
        tutor.name.toLowerCase().includes(term) ||
        tutor.topics.some(t => t.toLowerCase().includes(term))
      )
      : true;

    // A tutor must pass BOTH checks to be shown.
    return matchesModule && matchesSearch;
  });

  return (
    <div className="container-fluid px-5">

      {/* --- PAGE HEADER --- */}
      <div className="mb-4 mt-4">
        <h1 className="display-4 fw-bold">Find a Peer Tutor</h1>
        <p className="lead text-muted">Search by module code or specific topic</p>
      </div>

      {/* --- SEARCH & FILTER SECTION --- */}
      <div className="card p-4 mb-5 bg-light border-0 rounded-3 shadow-sm">
        <div className="row g-3">

          {/* A. MODULE DROPDOWN */}
          <div className="col-md-3">
            <select
              className="form-select form-select-lg"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="">All Modules</option>
              {modules.map((mod) => (
                <option key={mod.code} value={mod.code}>
                  {mod.code} - {mod.name}
                </option>
              ))}
            </select>
          </div>

          {/* B. TEXT SEARCH INPUT */}
          <div className="col-md-9">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Search topic or tutor name (e.g. React, Jun Hao)"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- RESULTS GRID --- */}
      <div className="row">
        {filteredTutors.length > 0 ? (
          // IF DATA EXISTS: Loop through the filtered list and render a card for each
          filteredTutors.map((tutor) => (
            // We pass the entire 'tutor' object to the Child Component
            <TutorCard key={tutor._id} tutor={tutor} />
          ))
        ) : (
          // IF NO MATCHES: Show a friendly "Not Found" message
          <div className="col-12 text-center py-5">
            <h3 className="text-muted">No tutors found.</h3>
            <p>Try changing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;