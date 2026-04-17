import React, { useEffect, useState } from "react";
// import your API utility here, e.g. import { fetchUsers, deleteUser } from "../../utils/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Fetch users from backend
    // fetchUsers().then(setUsers).catch(setError).finally(() => setLoading(false));
    setLoading(false); // Remove this after implementing fetch
  }, []);

  const handleDelete = (userId) => {
    // TODO: Call deleteUser(userId) and update state
    // deleteUser(userId).then(() => setUsers(users.filter(u => u.id !== userId)));
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan="4" className="text-center py-4">No users found.</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.firstName} {user.lastName}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(user.id)}>Delete</button>
                  {/* Add Edit button here if needed */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
