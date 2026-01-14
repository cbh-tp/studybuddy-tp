import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TutorDashboard({ user, refreshTutors }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // UPDATED URL
            fetch('https://studybuddy-backend-67h9.onrender.com/api/tutors')
                .then(res => res.json())
                .then(data => {
                    const myProfile = data.find(t => t.userId === user.userId);
                    if (myProfile) {
                        if (!myProfile.modules) myProfile.modules = [];
                        if (!myProfile.topics) myProfile.topics = [];
                        if (!myProfile.availability) myProfile.availability = [];
                    }
                    setProfile(myProfile);
                    setLoading(false);
                });
        }
    }, [user]);

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

    const handleAddSlot = (e) => {
        e.preventDefault();
        if (!newDate || !newTime) return alert("Please pick both Date and Time");

        const newSlot = {
            id: Date.now().toString(),
            date: newDate,
            time: newTime,
            status: "Available"
        };

        setProfile({
            ...profile,
            availability: [...profile.availability, newSlot]
        });

        setNewDate("");
        setNewTime("");
    };

    const handleRemoveSlot = (slotId) => {
        const updatedSlots = profile.availability.filter(slot => slot.id !== slotId);
        setProfile({ ...profile, availability: updatedSlots });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // UPDATED URL
            const response = await fetch(`https://studybuddy-backend-67h9.onrender.com/api/tutors/${user.userId}`, {
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

            <form onSubmit={handleSave} className="card p-4 shadow-sm">
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

                <h4 className="mb-3">Manage Availability</h4>

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

                <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">Save All Changes</button>
                </div>
            </form>
        </div>
    );
}

export default TutorDashboard;