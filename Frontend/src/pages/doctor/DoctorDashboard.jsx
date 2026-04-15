import React from "react";

const DoctorDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">CareLink</h2>
        <ul className="space-y-4">
          <li>Dashboard</li>
          <li>Patients</li>
          <li>Appointments</li>
          <li>Messages</li>
          <li>Video Calls</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        
        {/* Header */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold">Doctor Dashboard</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <p>Total Patients</p>
            <h2 className="text-xl font-bold">120</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p>Appointments Today</p>
            <h2 className="text-xl font-bold">8</h2>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p>Pending Requests</p>
            <h2 className="text-xl font-bold">3</h2>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Today's Appointments</h2>
          <ul>
            <li className="flex justify-between py-2">
              <span>John Doe - 10:00 AM</span>
              <button className="bg-green-500 text-white px-3 py-1 rounded">
                Join Call
              </button>
            </li>
          </ul>
        </div>

        {/* Patients */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Patients</h2>
          <ul>
            <li className="flex justify-between py-2">
              <span>Jane Smith</span>
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                View
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;