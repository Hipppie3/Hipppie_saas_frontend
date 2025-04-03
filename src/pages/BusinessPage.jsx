import React, { useState, useEffect } from 'react';
import api from '@api'
import './BusinessPage.css'; // (optional CSS)

function BusinessPage() {
 const initialForm = {
  name: '',
  phone: '',
  email: '',
  website: '',
  city: '',
  state: '',
  location: '',
  facebook: '',
  instagram: '',
  sport: '',
  category: '',
  season: '',
  nextSeason: '',
  signupDeadline: '',
  signupStatus: 'active',
  cost: '',
  skillLevel: ''
 };

 const [form, setForm] = useState(initialForm);
 const [businesses, setBusinesses] = useState([]);
 const [editingId, setEditingId] = useState(null);

 useEffect(() => {
  fetchBusinesses();
 }, []);

 const fetchBusinesses = async () => {
  const res = await api.get('/api/businesses');
  setBusinesses(res.data);
 };

 const handleChange = (e) => {
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
   if (editingId) {
    await api.put(`/api/businesses/${editingId}`, form);
   } else {
    await api.post('/api/businesses', form);
   }
   fetchBusinesses();
   setForm(initialForm);
   setEditingId(null);
  } catch (err) {
   console.error('Error submitting form:', err);
  }
 };

 const handleEdit = (biz) => {
  setForm(biz);
  setEditingId(biz.id);
 };

 const handleDelete = async (id) => {
  try {
   await api.delete(`/api/businesses/${id}`);
   fetchBusinesses();
  } catch (err) {
   console.error('Error deleting business:', err);
  }
 };

 return (
  <div className="business-page">
   <h2>{editingId ? 'Update Business' : 'Add New Business'}</h2>
   <form onSubmit={handleSubmit} className="business-form">
    {Object.keys(initialForm).map((key) => (
     <div key={key} className="form-group">
      <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
      {key === 'signupStatus' ? (
       <select name={key} value={form[key]} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="closed">Closed</option>
       </select>
      ) : (
       <input
        type="text"
        name={key}
        value={form[key]}
        onChange={handleChange}
        placeholder={`Enter ${key}`}
       />
      )}
     </div>
    ))}
    <button type="submit">{editingId ? 'Update' : 'Create'} Business</button>
   </form>

   <h3>All Businesses</h3>
   <div className="business-list">
    {businesses.map((biz) => (
     <div key={biz.id} className="business-card">
      <h4>{biz.name}</h4>
      <p>📍 {biz.location}, {biz.city}, {biz.state}</p>
      <p>📞 {biz.phone} | ✉️ {biz.email}</p>
      <p>🏷 Sport: {biz.sport} | Category: {biz.category}</p>
      <p>📅 Season: {biz.season} → {biz.nextSeason}</p>
      <p>💵 Cost: {biz.cost} | Level: {biz.skillLevel}</p>
      <p>⏳ Deadline: {biz.signupDeadline} | Status: {biz.signupStatus}</p>
      <div className="btn-group">
       <button onClick={() => handleEdit(biz)}>✏️ Edit</button>
       <button onClick={() => handleDelete(biz.id)}>🗑 Delete</button>
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}

export default BusinessPage;
