import { useState, useRef } from 'react';

const ProfilePage = ({ currentUser, myPlans, joinedTrips, pendingTrips, onUpdateProfile, onLogout, onOpenChat }) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    username: currentUser.username || '',
    phone: currentUser.phone || '',
    password: '',
    country: currentUser.country || '',
    city: currentUser.city || '',
    profilePhoto: currentUser.profilePhoto || '',
    dateOfBirth: currentUser.dateOfBirth || '',
    gender: currentUser.gender || '',
    nationality: currentUser.nationality || '',
    bio: currentUser.bio || '',
    location: currentUser.location || '',
    interests: currentUser.interests || '',
    languages: currentUser.languages || '',
    travelStyle: currentUser.travelStyle || '',
    travelerType: currentUser.travelerType || '',
    preferredDestinations: currentUser.preferredDestinations || '',
    budgetRange: currentUser.budgetRange || '',
    preferredSeason: currentUser.preferredSeason || '',
    instagramHandle: currentUser.instagramHandle || ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = { ...formData };
      if (!updates.password) delete updates.password;
      await onUpdateProfile(updates);
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('profilePhoto', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate stats
  const totalTrips = myPlans.length;
  const totalBuddies = [...new Set(myPlans.flatMap(plan => plan.members?.map(m => m._id) || []))].length;
  const totalDistance = myPlans.reduce((sum, plan) => sum + (plan.distance || 0), 0);

  const InfoCard = ({ icon, label, value }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 font-medium">{label}</div>
          <div className="text-gray-900 font-semibold mt-0.5">{value || <span className="text-gray-400 italic">Not set</span>}</div>
        </div>
      </div>
    </div>
  );

  const InterestBadge = ({ text, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
        selected
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
      }`}
    >
      {selected && '✓ '}{text}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Hero Header with Cover */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-48">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE zNGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDIgLjkgMiAyIDIgMi0uOSAyLTJ6bTAgMTBjMC0xLjEtLjktMi0yLTJzLTIgLjktMiAyIC45IDIgMiAyIDItLjkgMi0yem0wIDEwYzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnptMTAgMGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDIgLjkgMiAyIDIgMi0uOSAyLTJ6bTAgMTBjMC0xLjEtLjktMi0yLTJzLTIgLjktMiAyIC45IDIgMiAyIDItLjkgMi0yem0tMTAgMGMwLTEuMS0uOS0yLTItMnMtMiAuOS0yIDIgLjkgMiAyIDIgMi0uOSAyLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 relative overflow-hidden">
          {/* Animated background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -z-10"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="relative">
                {formData.profilePhoto ? (
                  <img 
                    src={formData.profilePhoto} 
                    alt={formData.name} 
                    className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl transition-transform duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl ring-4 ring-white transition-transform duration-300 group-hover:scale-105">
                    {formData.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-2xl font-bold"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    {formData.name}
                    {currentUser.phoneVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">@{formData.username || 'username'} • {formData.email}</p>
                  {formData.bio && (
                    <p className="text-gray-700 mb-4 leading-relaxed">{formData.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.country && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {formData.city}, {formData.country}
                      </span>
                    )}
                    {formData.travelerType && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {formData.travelerType} Traveler
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{totalTrips}</div>
                  <div className="text-sm text-gray-600 font-medium">Trips</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{totalBuddies}</div>
                  <div className="text-sm text-gray-600 font-medium">Buddies</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold text-green-600 mb-1">{totalDistance.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 font-medium">KM Traveled</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : '✓ Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        ...formData,
                        name: currentUser.name || '',
                        email: currentUser.email || '',
                        password: ''
                      });
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold border-2 border-red-200 hover:bg-red-100 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Sections */}
        {isEditing ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl shadow-lg p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📱 Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">⚧️ Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🎂 Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🏳️ Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="e.g., American, Indian"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-3xl shadow-lg p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📍</span>
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🌍 Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="Your country"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🏙️ City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Your city"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📫 Full Address</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Your full address"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Travel Profile */}
            <div className="bg-white rounded-3xl shadow-lg p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">✈️</span>
                Travel Profile
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Travel Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {['Photography', 'Beaches', 'Wildlife', 'Adventure', 'Culture', 'Food', 'Mountains', 'Nightlife', 'Shopping', 'Relaxation', 'Sports', 'Hiking'].map(interest => {
                      const selected = formData.interests.split(',').map(i => i.trim()).includes(interest);
                      return (
                        <InterestBadge
                          key={interest}
                          text={interest}
                          selected={selected}
                          onClick={() => {
                            const interests = formData.interests.split(',').map(i => i.trim()).filter(Boolean);
                            if (selected) {
                              updateField('interests', interests.filter(i => i !== interest).join(', '));
                            } else {
                              updateField('interests', [...interests, interest].join(', '));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'Hindi', 'Spanish', 'Mandarin', 'French', 'German', 'Arabic', 'Japanese', 'Portuguese'].map(lang => {
                      const selected = formData.languages.split(',').map(l => l.trim()).includes(lang);
                      return (
                        <InterestBadge
                          key={lang}
                          text={lang}
                          selected={selected}
                          onClick={() => {
                            const languages = formData.languages.split(',').map(l => l.trim()).filter(Boolean);
                            if (selected) {
                              updateField('languages', languages.filter(l => l !== lang).join(', '));
                            } else {
                              updateField('languages', [...languages, lang].join(', '));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">✍️ About Me</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Tell others about yourself, your travel experiences..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Traveler Type</label>
                    <select
                      value={formData.travelerType}
                      onChange={(e) => updateField('travelerType', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    >
                      <option value="">Select Type</option>
                      <option value="Solo">Solo Traveler</option>
                      <option value="Family">Family Traveler</option>
                      <option value="Friends">With Friends</option>
                      <option value="Couple">Couple</option>
                      <option value="Business">Business Traveler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Budget Range</label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => updateField('budgetRange', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    >
                      <option value="">Select Budget</option>
                      <option value="Budget">Budget ($)</option>
                      <option value="Moderate">Moderate ($$)</option>
                      <option value="Luxury">Luxury ($$$)</option>
                      <option value="Ultra-Luxury">Ultra-Luxury ($$$$)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Info Display */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard icon="📱" label="Phone" value={formData.phone} />
                <InfoCard icon="⚧️" label="Gender" value={formData.gender} />
                <InfoCard icon="🎂" label="Date of Birth" value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : ''} />
                <InfoCard icon="🏳️" label="Nationality" value={formData.nationality} />
                <InfoCard icon="🌍" label="Country" value={formData.country} />
                <InfoCard icon="🏙️" label="City" value={formData.city} />
              </div>
              {formData.location && (
                <div className="mt-4">
                  <InfoCard icon="📫" label="Full Address" value={formData.location} />
                </div>
              )}
            </div>

            {/* Travel Profile Display */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">✈️</span>
                Travel Profile
              </h2>
              
              {formData.interests && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Travel Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.split(',').map(interest => interest.trim()).filter(Boolean).map(interest => (
                      <span key={interest} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.languages && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.split(',').map(lang => lang.trim()).filter(Boolean).map(lang => (
                      <span key={lang} className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">About Me</h3>
                  <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">{formData.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.travelerType && <InfoCard icon="👤" label="Traveler Type" value={formData.travelerType} />}
                {formData.budgetRange && <InfoCard icon="💰" label="Budget Range" value={formData.budgetRange} />}
              </div>
            </div>

            {/* My Trips Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🗺️</span>
                My Travel Plans
              </h2>
              {myPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPlans.slice(0, 4).map(trip => (
                    <div key={trip._id} className="p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                      <h3 className="font-bold text-gray-900 mb-2">{trip.destination}</h3>
                      <p className="text-sm text-gray-600 mb-2">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{trip.members?.length || 0} members</span>
                        {trip.isPublic && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Public</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p>No trips yet. Create your first travel plan!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
