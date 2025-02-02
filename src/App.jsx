import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api'); // ✅ Vite proxies this to http://localhost:5122/api/test
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>🏀 Basketball SaaS Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
