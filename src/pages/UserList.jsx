import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './UserList.css';
import LeagueGameAuth from '../pages/Game/LeagueGameAuth.jsx'

function UserList() {
  const { user, deleteUser, register } = useAuth();
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ username: "", password: "", email: "", domain: "" });
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ id: null, username: "", email: "",  domain: "" });

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get('/api/users/userList', { withCredentials: true });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users');
      }
    };
    getUser();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();

    const sanitizedForm = {
      ...userForm,
      email: userForm.email.trim() !== "" ? userForm.email : null,
      password: userForm.password.trim() !== "" ? userForm.password : null,
      domain: userForm.domain.trim() !== "" ? userForm.domain : null,
    };

    try {
      const response = await register(sanitizedForm);

      if (response.success && response.user) {
        setUsers((prevUsers) => [...prevUsers, response.user]);
        setMessage(`User ${response.user.username} created successfully`);
        setTimeout(() => setMessage(''), 3000);
        setIsModalOpen(false);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedUsers.length === 0) {
      alert("No users selected for deletion.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete the selected users?");
    if (!confirmDelete) return;

    try {
      for (const userId of selectedUsers) {
        const response = await deleteUser(userId);
        if (!response.success) {
          alert(`Failed to delete user with ID: ${userId}`);
        }
      }

      setUsers((prevUsers) => prevUsers.filter((user) => !selectedUsers.includes(user.id)));
      setMessage(`Deleted ${selectedUsers.length} user(s) successfully`);
      setTimeout(() => setMessage(''), 3000);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const handleCheckboxChange = (id) => {
    setSelectedUsers(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    );
  };

  // Open update modal and populate form with user data
  const openUpdateModal = (user) => {
    setUpdateForm({
      id: user.id,
      username: user.username,
      email: user.email || "",
      domain: user.domain || "",
    });
    setIsUpdateModalOpen(true);
  };

  // Handle user update submission
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const sanitizedForm = {
      ...updateForm,
      email: updateForm.email.trim() === "" ? "" : updateForm.email,
      domain: updateForm.domain.trim() === "" ? "" : updateForm.domain,
    };
    try {
      const response = await axios.put(`/api/users/${updateForm.id}`, sanitizedForm, { withCredentials: true });
      if (response.data.success) {
        setMessage(`User ${updateForm.username} updated successfully`);
        // ✅ Refetch users after update to get the latest data
        const updatedUsers = await axios.get('/api/users/userList', { withCredentials: true });
        setUsers(updatedUsers.data.users);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsUpdateModalOpen(false);
    }
  };




  return (
    <div className="userList-auth">
      <h2 className="userList-auth-title">All Users</h2>
      {user?.role === "super_admin" && (
        <div className="user-btn-container">
          <button className="delete-user-btn" onClick={handleDelete}>🗑️</button>
          <button className="add-user-btn" onClick={() => setIsModalOpen(true)}>+ Add User</button>
        </div>
      )}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create User</h3>
            <form onSubmit={createUser}>
              <label>
                Username:
                <input type="text" name="username" value={userForm.username} onChange={handleInputChange} required />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={userForm.email} onChange={handleInputChange} />
              </label>
              <label>
                Password:
                <input type="password" name="password" value={userForm.password} onChange={handleInputChange} />
              </label>
              <label>
                Domain:
                <input type="text" name="domain" value={userForm.domain} onChange={handleInputChange} />
              </label>
              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <table className="userList-table">
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Users</th>
            <th>Email</th>
            <th>Domain</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.filter(Boolean).map((user, index) => (
            <tr key={user.id}>
              <td>
                {user.role !== "super_admin" && (
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                )}
              </td>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.domain}</td>
              <td>
                <button className="leagueList-update-btn" onClick={() => openUpdateModal(user)}>
                  <span>🖊</span> EDIT
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && <p>{message}</p>}

      {/* Update User Modal */}
      {isUpdateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update User</h3>
            <form onSubmit={handleUpdateUser}>
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={updateForm.username}
                  onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={updateForm.email}
                  onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                />
              </label>
              <label>
                Domain:
                <input
                  type="text"
                  name="domain"
                  value={updateForm.domain}
                  onChange={(e) => setUpdateForm({ ...updateForm, domain: e.target.value })}
                />
              </label>
              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsUpdateModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
