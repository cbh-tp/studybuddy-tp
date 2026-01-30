import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TutorDashboard({ user, refreshTutors }) {
    // --- STATE MANAGEMENT ---
    const [profile, setProfile] = useState(null); // Stores the full tutor object
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");   // Used for success/error alerts

    // State for the "Add New Slot" inputs
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    const navigate = useNavigate();

    // 🚀 API CONFIGURATION
    const API_URL = 'https://studybuddy-backend-67h9.onrender.com';

    // --- 1. FETCH PROFILE ON LOAD ---
    useEffect(() => {
        if (user) {
            // Fetch all tutors and find "Me" based on the logged-in user's ID
            fetch(`${API_URL}/api/tutors`)
                .then(res => res.json())
                .then(data => {
                    const myProfile = data.find(t => t.userId === user.userId);

                    if (myProfile) {
                        // Defensive Coding: Ensure arrays exist even if database is empty
                        if (!myProfile.modules) myProfile.modules = [];
                        if (!myProfile.topics) myProfile.topics = [];
                        if (!myProfile.availability) myProfile.availability = [];
                    }

                    setProfile(myProfile);
                    setLoading(false);
                });
        }
    }, [user]);

    // --- 2. INPUT HANDLERS (Text Fields) ---
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // Special Handler: Converts "Math, Science" string -> ["Math", "Science"] array
    const handleModulesChange = (e) => {
        const modulesArray = e.target.value.split(',').map(s => s.trim());
        setProfile({ ...profile, modules: modulesArray });
    };

    // Special Handler: Converts "Algebra, Geometry" string -> ["Algebra", "Geometry"] array
    const handleTopicsChange = (e) => {
        const topicsArray = e.target.value.split(',').map(s => s.trim());
        setProfile({ ...profile, topics: topicsArray });
    };

    // --- 3. AVAILABILITY LOGIC (Add/Remove Slots) ---
    const handleAddSlot = (e) => {
        e.preventDefault(); // Stop form from submitting
        if (!newDate || !newTime) return alert("Please pick both Date and Time");

        const newSlot = {
            id: Date.now().toString(), // Generates a unique ID based on current timestamp
            date: newDate,
            time: newTime,
            status: "Available"
        };

        // Update local state (UI updates immediately)
        setProfile({
            ...profile,
            availability: [...profile.availability, newSlot]
        });

        // Clear inputs
        setNewDate("");
        setNewTime("");
    };

    const handleRemoveSlot = (slotId) => {
        // Filter out the slot that matches the ID
        const updatedSlots = profile.availability.filter(slot => slot.id !== slotId);
        setProfile({ ...profile, availability: updatedSlots });
    };

    // --- 4. SAVE CHANGES TO SERVER ---
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/tutors/${user.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });

            if (response.ok) {
                refreshTutors(); // Tell App.jsx to update the global list
                alert("Profile & Availability Saved!");
                navigate('/');   // Send user back to Home
            } else {
                setMessage("❌ Failed to save profile.");
            }
        } catch (err) {
            setMessage("❌ Error updating profile.");
        }
    };

    // --- CONDITIONAL RENDERING ---
    if (!user) return <div className="p-5">Please Login.</div>;
    if (loading) return <div className="p-5">Loading Profile...</div>;
    if (!profile) return <div className="p-5">No Tutor Profile found.</div>;

    return (
        <div className="container mt-5 mb-5">
            <h1>Tutor Dashboard</h1>

            {/* STATS CARDS */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card text-white bg-primary mb-3">
                        <div className="card-header">Hourly Rate</div>
                        <div className="card-body">
                            <h2 className="card-title">${profile.hourlyRate}</h2>
                            <p className="card-text">Per session</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card text-white bg-success mb-3">
                        <div className="card-header">Active Slots</div>
                        <div className="card-body">
                            <h2 className="card-title">{profile.availability.length}</h2>
                            <p className="card-text">Open for booking</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN FORM */}
            <form onSubmit={handleSave} className="card p-4 shadow-sm">
                <h4 className="mb-3">Profile Details</h4>

                {/* Basic Info */}
                <div className="mb-3">
                    <label className="form-label">Display Name</label>
                    <input type="text" className="form-control" name="name" value={profile.name} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" name="bio" rows="3" value={profile.bio} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Hourly Rate ($)</label>
                    <input type="number" className="form-control" name="hourlyRate" value={profile.hourlyRate} onChange={handleChange} />
                </div>

                {/* Array Inputs (Modules & Topics) */}
                <div className="mb-3">
                    <label className="form-label">Modules (comma separated)</label>
                    <input type="text" className="form-control" value={profile.modules.join(", ")} onChange={handleModulesChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Topics / Tags (comma separated)</label>
                    <input type="text" className="form-control" value={profile.topics.join(", ")} onChange={handleTopicsChange} />
                </div>

                <hr className="my-4" />

                {/* AVAILABILITY MANAGER */}
                <h4 className="mb-3">Manage Availability</h4>

                {/* Add Slot Controls */}
                <div className="row g-2 align-items-end mb-3">
                    <div className="col-md-4">
                        <label className="form-label small text-muted">Date</label>
                        <input type="date" className="form-control" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small text-muted">Time</label>
                        <input type="time" className="form-control" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <button type="button" className="btn btn-success w-100" onClick={handleAddSlot}>
                            + Add Slot
                        </button>
                    </div>
                </div>

                {/* List of Existing Slots */}
                <ul className="list-group mb-4">
                    {profile.availability.length === 0 && <li className="list-group-item text-muted fst-italic">No slots added yet.</li>}
                    {profile.availability.map((slot) => (
                        <li key={slot.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>📅 {slot.date} &nbsp; ⏰ {slot.time}</span>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveSlot(slot.id)}>
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>

                {/* SAVE BUTTON */}
                <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">Save All Changes</button>
                </div>
            </form>
        </div>
    );
}

export default TutorDashboard;