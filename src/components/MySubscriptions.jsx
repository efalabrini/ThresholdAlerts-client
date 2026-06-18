import React, { useEffect, useState } from 'react';
import { loginRequest } from "../authConfig";
import { useMsal } from "@azure/msal-react";

const MySubscriptions = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { instance } = useMsal();
  
    useEffect(() => {
      const fetchData = async () => {

        const account = instance.getActiveAccount();
        if (!account) {
            throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
        }
    
        const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account
        });
        const accessToken = response.accessToken;

        const apiUrl = import.meta.env.VITE_API_URL  + 'api/User/me/subscriptions';

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
                'Content-type' : 'application/json'
            }
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const result = await response.json();
          setData(result);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    },[]);
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }

    const handleDelete = async (measurementId) => {    
      const account = instance.getActiveAccount();
        if (!account) {
            throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
        }
    
        const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account
        });
        const accessToken = response.accessToken;

        const apiUrl = import.meta.env.VITE_API_URL   +  `api/User/me/subscription?measurementId=${measurementId}`;

      try {
        const response = await fetch(
          apiUrl,
          {
            method: 'DELETE',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
                'Content-type' : 'application/json'
            }
          }
        );
    
        if (response.ok) {
          // Optionally, update the local data to remove the deleted subscription.
          setData((prevData) => prevData.filter((item) => item.measurementId !== measurementId));
        } else {
          alert("Failed to delete the subscription.");
        }
      } catch (error) {
        console.error("Error deleting subscription:", error);
        alert("An error occurred while trying to delete the subscription.");
      }
    };
  
    return (
    <div className="measurement-panel">
      <h2 className="measurement-header">My Subscriptions</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Measurement</th>
              <th>Unit</th>
              <th>Lower Threshold</th>
              <th>Upper Threshold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td data-label="Measurement">{item.measurement}</td>
                <td data-label="Unit">{item.measurementUnit}</td>
                <td data-label="Lower Threshold">{new Intl.NumberFormat('en-US').format(item.lowerThreshold)}</td>
                <td data-label="Upper Threshold">{new Intl.NumberFormat('en-US').format(item.upperThreshold)}</td>
                <td data-label="Actions" className="cell-center">
                  <button
                    onClick={() => handleDelete(item.measurementId)}
                    className="cozy-button cozy-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MySubscriptions;
