import React, { useEffect, useState } from 'react';
import { loginRequest } from "../authConfig";
import { useMsal } from "@azure/msal-react";

const AlertServiceStatus = () => {
  const [status, setStatus] = useState(null); // `null` for initial loading state
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(null); // For `periodInMinutes`
  const [startTime, setstartTime] = useState(null);
  const { instance } = useMsal();

  const apiBase = import.meta.env.VITE_API_URL;

  const fetchStatus = async () => {
    try {
      const apiUrl = apiBase + 'api/ConfigInfo/alertservice/status';
      const response = await fetch(apiUrl, {
        headers: { accept: 'text/plain' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data.isRunning);
      setPeriod(data.periodInMinutes);
      setstartTime(data.startTime);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleStartService = async () => {
    try {
      const account = instance.getActiveAccount();
      if (!account) {
        throw Error("No active account! Verify a user has been signed in and setActiveAccount has been called.");
      }

      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });
      const accessToken = response.accessToken;

      const keepAliveUrl = apiBase + 'api/ScheduleKeepAliveWork?periodInMinutes=2';
      const scheduleUrl = apiBase + 'api/ScheduleWork?periodInMinutes=15';
      const opts = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-type': 'application/json'
        }
      };

      const [r1, r2] = await Promise.all([fetch(keepAliveUrl, opts), fetch(scheduleUrl, opts)]);
      if (!r1.ok || !r2.ok) {
        const statuses = `ScheduleKeepAliveWork: ${r1.status}, ScheduleWork: ${r2.status}`;
        throw new Error(`Start service failed: ${statuses}`);
      }

      // refresh status after scheduling
      await fetchStatus();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (status === null) {
    return <div>Loading...</div>;
  }

  const textStyle = {
    color: status ? 'green' : 'red',
    fontSize: '12px',
    textAlign: 'left',
    paddingLeft: '10px',
    display: 'flex',
    alignItems: 'center',
  };

  const buttonStyle = {
    marginLeft: '8px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
  };

  function formatReadAtDate(readAt) {
    return readAt
        ? new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
          }).format(new Date(readAt))
        : '';
  }

  return (
    <div style={textStyle}>
      {status ? (
        `Alert Service running every ${period} minutes (Started at ${formatReadAtDate(startTime)})`
      ) : (
        <>
          <span>Alert Service stopped</span>
          <button style={buttonStyle} onClick={handleStartService}>Start Service</button>
        </>
      )}
    </div>
  );
};

export default AlertServiceStatus;