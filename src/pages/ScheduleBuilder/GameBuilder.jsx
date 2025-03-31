import React from 'react';
import api from '@api';

const GameBuilder = ({ scheduleId, weekIndex, onGenerated }) => {
 const handleGenerate = async () => {
  const confirmed = window.confirm(
   `This will overwrite any existing games for Week ${weekIndex + 1}. Continue?`
  );

  if (!confirmed) return;

  try {
   const res = await api.post(
    '/api/games/generate-weekly-games',
    { scheduleId, weekIndex },
    { withCredentials: true }
   );
   alert(res.data.message || 'Games generated!');

   // ✅ Refetch games after successful generation
   if (onGenerated) onGenerated();
  } catch (err) {
   console.error('Error generating games:', err);
   alert('Failed to generate games');
  }
 };

 return (
  <button onClick={handleGenerate}>
   Generate Games for Week {weekIndex + 1}
  </button>
 );
};

export default GameBuilder;
