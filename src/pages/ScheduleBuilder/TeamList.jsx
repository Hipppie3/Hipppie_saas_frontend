import React from 'react';

function TeamList({ teams }) {
 if (!teams.length) return <p>No teams found.</p>;

 return (
  <div className="team-list">
   <h3>Teams in this League</h3>
   <ul>
    {teams.map((team) => (
     <li key={team.id}>
      <strong>{team.name}</strong>
      {team.league && <span> — {team.league.name}</span>}
     </li>
    ))}
   </ul>
  </div>
 );
}

export default TeamList;
