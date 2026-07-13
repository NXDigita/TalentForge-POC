import axios from 'axios';
import { useEffect, useState } from 'react';

function Home() {
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/students/problems').then((response) => setProblems(response.data));
  }, []);

  return (
    <div>
      <h2>Student problem board</h2>
      <ul>
        {problems.map((problem) => (
          <li key={problem.id}>{problem.title} ({problem.tier})</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
