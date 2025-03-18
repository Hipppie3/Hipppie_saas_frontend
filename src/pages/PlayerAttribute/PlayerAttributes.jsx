import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlayerAttributes() {
 const [attributes, setAttributes] = useState([]);
 const userId = 1; // Replace with the actual userId

 useEffect(() => {
  // Fetch player attributes
  axios.get(`/api/playerAttributes/${userId}`)
   .then(response => {
    setAttributes(response.data);
   })
   .catch(error => {
    console.error('Error fetching player attributes:', error);
   });
 }, [userId]);

 return (
  <div>
   <h2>Player Attributes</h2>
   <ul>
    {attributes.map(attribute => (
     <li key={attribute.key}>
      {attribute.name} ({attribute.type}) - {attribute.visible ? 'Visible' : 'Hidden'}
     </li>
    ))}
   </ul>
  </div>
 );
}

export default PlayerAttributes;
