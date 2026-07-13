import axios from 'axios';
import { useEffect, useState } from 'react';

function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    axios.get('/api/students/profile').then((response) => setProfile(response.data));
  }, []);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div>
      <h2>{profile.name}</h2>
      <p>Domain: {profile.domain}</p>
      <p>Tier: {profile.tier}</p>
      <p>XP: {profile.xp}</p>
    </div>
  );
}

export default Profile;
