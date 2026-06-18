import React, { useEffect, useState } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

const MeasurementList = ({ onSubscriptionAdded }) => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL  + 'api/Measurement';
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  const [thresholds, setThresholds] = useState({
    lowerThreshold: '',
    upperThreshold: '',
  });
  const { instance } = useMsal();

  const selectedMeasurement = data.find((entity) => `${entity.id}` === selectedMeasurementId);

  console.log(apiUrl);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
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

  const handleAddSubscription = (id) => {
    if (!id) {
      alert('Please select a measurement before subscribing.');
      return;
    }

    setCurrentId(id);
    setModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectionChange = (e) => {
    setSelectedMeasurementId(e.target.value);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setThresholds({ lowerThreshold: '', upperThreshold: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setThresholds((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { lowerThreshold, upperThreshold } = thresholds;

    try {

      const account = instance.getActiveAccount();
        if (!account) {
            throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
        }

      const responselog = await instance.acquireTokenSilent({
            ...loginRequest,
            account: account
        })
      const accessToken = responselog.accessToken;
      const apiUrl = import.meta.env.VITE_API_URL   + `api/User/me/subscription?measurementId=${currentId}`;
      const response = await fetch(
        apiUrl,
        {
          method: 'PUT',
          headers: {
            'accept': 'text/plain',
            'Authorization': `Bearer ${accessToken}`, // Replace with the actual token
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lowerThreshold: Number(lowerThreshold),
            upperThreshold: Number(upperThreshold),
          }),
        }
      );

      if (response.ok) {
        onSubscriptionAdded(); // Notify App.js to reload MySubscriptions
      } else {
        const errorText = await response.text();
        alert(`Failed to add subscription: ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('An error occurred while adding the subscription.');
    } finally {
      handleCloseModal();
    }
  };

  return (
    <div>
      <h2>Measurements</h2>
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '0.75rem',
            alignItems: 'end',
          }}
        >
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            <label htmlFor="measurement-select">Select measurement</label>
            <select
              id="measurement-select"
              value={selectedMeasurementId}
              onChange={handleSelectionChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              <option value="">-- Select a measurement --</option>
              {data.map((entity) => (
                <option key={entity.id} value={`${entity.id}`}>
                  {entity.name} {entity.unit ? `(${entity.unit})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleAddSubscription(selectedMeasurementId)}
            disabled={!selectedMeasurementId}
            style={{ padding: '10px 18px', height: '40px' }}
          >
            Subscribe
          </button>
        </div>
      </div>

      {selectedMeasurement && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <strong>Selected measurement:</strong>
          <p style={{ margin: '0.25rem 0' }}>{selectedMeasurement.name} {selectedMeasurement.unit ? `(${selectedMeasurement.unit})` : ''}</p>
          <p style={{ margin: '0.25rem 0' }}>
            <a href={selectedMeasurement.apiUrl} target="_blank" rel="noopener noreferrer">{selectedMeasurement.apiUrl}</a>
          </p>
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            zIndex: 1000,
            width: '320px',
          }}
        >
          <h3>Subscribe to measurement</h3>
          {selectedMeasurement && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>{selectedMeasurement.name}</strong>
              <div>{selectedMeasurement.unit}</div>
              <div>
                <a href={selectedMeasurement.apiUrl} target="_blank" rel="noopener noreferrer">
                  {selectedMeasurement.apiUrl}
                </a>
              </div>
            </div>
          )}
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Lower Threshold:
            <input
              type="number"
              name="lowerThreshold"
              value={thresholds.lowerThreshold}
              onChange={handleInputChange}
              style={{ margin: '8px 0 0', display: 'block', width: '100%' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Upper Threshold:
            <input
              type="number"
              name="upperThreshold"
              value={thresholds.upperThreshold}
              onChange={handleInputChange}
              style={{ margin: '8px 0 0', display: 'block', width: '100%' }}
            />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={handleSubmit} style={{ padding: '8px 16px' }}>
              Submit
            </button>
            <button onClick={handleCloseModal} style={{ padding: '8px 16px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={handleCloseModal}
        />
      )}

    </div>
  );
};

export default MeasurementList;
