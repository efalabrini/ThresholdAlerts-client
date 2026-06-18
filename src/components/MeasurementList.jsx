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
    <div className="measurement-panel">
      <h2 className="measurement-header">Measurements</h2>
      <div className="field-row">
        <div className="field-group">
          <label className="cozy-label" htmlFor="measurement-select">Select measurement</label>
          <select
            id="measurement-select"
            value={selectedMeasurementId}
            onChange={handleSelectionChange}
            className="cozy-select"
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
          className="cozy-button"
        >
          Subscribe
        </button>
      </div>

      {selectedMeasurement && (
        <div className="selected-card">
          <strong>Selected measurement:</strong>
          <p>{selectedMeasurement.name} {selectedMeasurement.unit ? `(${selectedMeasurement.unit})` : ''}</p>
          <p>
            <a href={selectedMeasurement.apiUrl} target="_blank" rel="noopener noreferrer">{selectedMeasurement.apiUrl}</a>
          </p>
        </div>
      )}

      {isModalOpen && (
        <div className="cozy-modal">
          <h3>Subscribe to measurement</h3>
          {selectedMeasurement && (
            <div className="selected-card" style={{ marginBottom: '1rem' }}>
              <strong>{selectedMeasurement.name}</strong>
              <div>{selectedMeasurement.unit}</div>
              <div>
                <a href={selectedMeasurement.apiUrl} target="_blank" rel="noopener noreferrer">
                  {selectedMeasurement.apiUrl}
                </a>
              </div>
            </div>
          )}
          <label className="cozy-label" htmlFor="lowerThreshold">
            Lower Threshold:
          </label>
          <input
            id="lowerThreshold"
            className="cozy-input"
            type="number"
            name="lowerThreshold"
            value={thresholds.lowerThreshold}
            onChange={handleInputChange}
          />
          <label className="cozy-label" htmlFor="upperThreshold">
            Upper Threshold:
          </label>
          <input
            id="upperThreshold"
            className="cozy-input"
            type="number"
            name="upperThreshold"
            value={thresholds.upperThreshold}
            onChange={handleInputChange}
          />
          <div className="cozy-modal-actions">
            <button onClick={handleSubmit} className="cozy-button">
              Submit
            </button>
            <button onClick={handleCloseModal} className="cozy-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="cozy-modal-backdrop" onClick={handleCloseModal} />
      )}

    </div>
  );
};

export default MeasurementList;
