import { useState } from 'react';
import TutorCard from '../components/TutorCard';

function Home({ tutors }) {

  // ✅ FIXED: Hardcoded list instead of reading from deleted JSON
  const modules = [
    { code: "CIT2C20", name: "Full Stack Web Development" },
    { code: "CIT2C21", name: "Software Engineering" },
    { code: "CIT2C22", name: "Database Management" }
  ];

  // Filter States
  const [selectedModule, setSelectedModule] = useState("");
  const [topicSearch, setTopicSearch] = useState("");

  // Filter Logic
  const filteredTutors = tutors.filter((tutor) => {

    // CHECK A: Module Filter
    const matchesModule = selectedModule
      ? tutor.modules.includes(selectedModule)
      : true;

    // CHECK B: Text Search
    const searchTerm = topicSearch.toLowerCase();

    const matchesSearch = topicSearch
      ? (
        tutor.name.toLowerCase().includes(searchTerm) ||
        tutor.topics.some(t => t.toLowerCase().includes(searchTerm))
      )
      : true;

    return matchesModule && matchesSearch;
  });

  return (
    <div className="container-fluid px-5">

      <div className="mb-4 mt-4">
        <h1 className="display-4 fw-bold">Find a Peer Tutor</h1>
        <p className="lead text-muted">Search by module code or specific topic</p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-5 bg-light border-0 rounded-3 shadow-sm">
        <div className="row g-3">

          {/* Dropdown: Filter by Module */}
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

          {/* Input: Search by Text */}
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

      {/* Result Grid */}
      <div className="row">
        {filteredTutors.length > 0 ? (
          filteredTutors.map((tutor) => (
            // ✅ FIXED: Using _id for the key
            <TutorCard key={tutor._id} tutor={tutor} />
          ))
        ) : (
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