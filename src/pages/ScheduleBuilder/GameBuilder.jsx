import React from 'react';
import api from '@api';

const GameBuilder = ({ scheduleId, onGenerated }) => {
 const handleGenerate = async () => {
  const confirmed = window.confirm(
   `This will overwrite all existing games for this schedule. Continue?`
  );
  if (!confirmed) return;

  try {
   const res = await api.post(
    '/api/games/generate-full-schedule',
    { scheduleId },
    { withCredentials: true }
   );
   alert(res.data.message || 'Full schedule generated!');

   if (onGenerated) onGenerated();
  } catch (err) {
   console.error('Error generating full schedule:', err);
   alert('Failed to generate full schedule');
  }
 };

 return <button onClick={handleGenerate}>Generate Full Schedule</button>;
};

export default GameBuilder;
