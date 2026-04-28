import { useEffect, useState } from "react";
import { adminApi } from "../lib/adminApi.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export function AdminUsers() {
  const { token, user } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers(token);
      setUsers(data.users);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const handleRoleChange = async (id, role) => {
    try {
      await adminApi.updateUserRole(token, id, { role });
      loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteUser(token, id);
      loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <p className="admin-navbar__eyebrow">Users Management</p>
          <h2>Team and customers</h2>
        </div>
      </div>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <div className="admin-table">
        <div className="admin-table__head admin-table__head--users">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Action</span>
        </div>

        {users.length ? (
          users.map((item) => (
            <div key={item._id} className="admin-table__row admin-table__row--users">
              <span>{item.name}</span>
              <span>{item.email}</span>
              <span>
                {user?.role === "admin" && item._id !== user.id ? (
                  <select value={item.role} onChange={(event) => handleRoleChange(item._id, event.target.value)}>
                    <option value="user">user</option>
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  item.role
                )}
              </span>
              <span>
                {user?.role === "admin" && item._id !== user.id ? (
                  <button type="button" className="admin-danger-button" onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                ) : (
                  <span className="admin-role-badge">Protected</span>
                )}
              </span>
            </div>
          ))
        ) : (
          <div className="admin-table__empty">No users found.</div>
        )}
      </div>
    </section>
  );
}
