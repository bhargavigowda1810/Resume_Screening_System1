function MyProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h1>My Profile</h1>

      <p>
        <strong>Name:</strong> {user?.name}
      </p>

      <p>
        <strong>Email:</strong> {user?.email}
      </p>

      <p>
        <strong>Role:</strong> {user?.role}
      </p>
    </div>
  );
}

export default MyProfile;