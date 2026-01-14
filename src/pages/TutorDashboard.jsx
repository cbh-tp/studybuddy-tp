import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TutorDashboard({ user, refreshTutors }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // State for the NEW slot input
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    const navigate = useNavigate();

    // 1. Fetch My Profile
    useEffect(() => {
        if (user) {
            fetch('http://localhost:5000/api/tutors')
                .then(res => res.json())
                .then(data => {
                    const myProfile = data.find(t => t.userId === user.userId);
                    if (myProfile) {
                        // Ensure all arrays exist to prevent crashes
                        if (!myProfile.modules) myProfile.modules = [];
                        if (!myProfile.topics) myProfile.topics = [];
                        if (!myProfile.availability) myProfile.availability = [];
                    }
                    setProfile(myProfile);
                    setLoading(false);
                });
        }
    }, [user]);

    // 2. Handle Text Inputs
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleModulesChange = (e) => {
        const modulesArray = e.target.value.split(',').map(s => s.trim());
        setProfile({ ...profile, modules: modulesArray });
    };

    const handleTopicsChange = (e) => {
        const topicsArray = e.target.value.split(',').map(s => s.trim());
        setProfile({ ...profile, topics: topicsArray });
    };

    // 3. NEW: Add a Time Slot
    const handleAddSlot = (e) => {
        e.preventDefault(); // Stop form submission
        if (!newDate || !newTime) return alert("Please pick both Date and Time");

        const newSlot = {
            id: Date.now().toString(), // Unique ID for React key
            date: newDate,
            time: newTime,
            status: "Available"
        };

        // Add to the profile state (not saved to DB yet)
        setProfile({
            ...profile,
            availability: [...profile.availability, newSlot]
        });

        // Clear inputs
        setNewDate("");
        setNewTime("");
    };

    // 4. NEW: Remove a Time Slot
    const handleRemoveSlot = (slotId) => {
        const updatedSlots = profile.availability.filter(slot => slot.id !== slotId);
        setProfile({ ...profile, availability: updatedSlots });
    };

    // 5. Save Changes
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/tutors/${user.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });

            if (response.ok) {
                refreshTutors();
                alert("Profile & Availability Saved!");
                navigate('/');
            } else {
                setMessage("❌ Failed to save profile.");
            }
        } catch (err) {
            setMessage("❌ Error updating profile.");
        }
    };

    if (!user) return <div className="p-5">Please Login.</div>;
    if (loading) return <div className="p-5">Loading Profile...</div>;
    if (!profile) return <div className="p-5">No Tutor Profile found.</div>;

    return (
        <div className="container mt-5 mb-5">
            <h1>Tutor Dashboard</h1>
            <p className="text-muted">Edit your public profile and manage availability.</p>

            {message && <div className="alert alert-danger">{message}</div>}

            <form onSubmit={handleSave} className="card p-4 shadow-sm">
                {/* --- SECTION 1: PROFILE DETAILS --- */}
                <h4 className="mb-3">Profile Details</h4>
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

                <div className="mb-3">
                    <label className="form-label">Modules (comma separated)</label>
                    <input type="text" className="form-control" value={profile.modules.join(", ")} onChange={handleModulesChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Topics / Tags (comma separated)</label>
                    <input type="text" className="form-control" value={profile.topics.join(", ")} onChange={handleTopicsChange} />
                </div>

                <hr className="my-4" />

                {/* --- SECTION 2: AVAILABILITY MANAGER --- */}
                <h4 className="mb-3">Manage Availability</h4>

                {/* Input Row */}
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

                {/* List of Slots */}
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

                {/* SUBMIT BUTTON */}
                <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">Save All Changes</button>
                </div>
            </form>
        </div>
    );
}

export default TutorDashboard;