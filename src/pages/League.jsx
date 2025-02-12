import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function League() {
  const [leagueInfo, setLeagueInfo] = useState({});
  const [teamForm, setTeamForm] = useState({name: ''})
  const [teams, setTeams] = useState([]);
  const { id } = useParams();

  const getLeague = async () => {
    try {
      console.log("Fetching league for ID:", id);
      const response = await axios.get(`/api/leagues/${id}`, { withCredentials: true });
      setLeagueInfo(response.data.league);
      console.log("League:", response.data);
    } catch (error) {
      console.error("Error fetching league:", error);
    }
  };

const getTeams = async () => {
  try {
    console.log("Fetching teams for league ID:", id);
    const teamResponse = await axios.get(`/api/leagues/${id}/teams`, { withCredentials: true });
    setTeams(teamResponse.data.teams);
    console.log("Teams:", teamResponse.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("No teams found, but that's okay!");
      setTeams([]); // Ensure teams state is empty instead of undefined
    } else {
      console.error("Unexpected error fetching teams:", error);
    }
  }
};


  useEffect(() => {
    getLeague();
    getTeams();
  }, [id]); // ✅ Now updates if `id` changes


  const handleTeamForm = (e) => {
    const {name, value} = e.target;
    setTeamForm((prevForm) => ({...prevForm, [name]: value}))
  } 

const submitTeam = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`/api/leagues/${id}/teams`, teamForm, { withCredentials: true });
    getTeams(''); // ✅ Refresh teams after creating one
    setTeamForm({name: ''})
  } catch (error) {
    console.error('Error creating team:', error);
  }
};

  return (
    <div>
      <h2>League: {leagueInfo.name}</h2>
      <div>
        <form onSubmit={submitTeam}>
          <label>Create Team  
            <input 
            type='text'
            name='name'
            value={teamForm.name}
            onChange={handleTeamForm}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div>
      <h2>Teams</h2>
      
      
      {teams.length === 0 ? (
        <p>No Teams</p>
      ) : ( 
      teams.map((team) => (
        <div key={team.id}> {/* ✅ Added key */}
          <h5>{team.name}</h5>
        </div>
      ))
    )}

      </div>
    </div>
  );
};

export default League;
