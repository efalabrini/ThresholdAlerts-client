import React, { useEffect, useState } from 'react';

const Readings = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL + 'api/Alert/ListMeasurementReadings';

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
    <div className="measurement-panel">
      <h2 className="measurement-header">Readings</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Meas.</th>
              <th>Unit</th>
              <th>Value</th>
              <th>Min</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entity) => (
              <tr key={entity.id}>
                <td data-label="Meas.">{entity.measurement}</td>
                <td data-label="Unit">{entity.unit}</td>
                <td data-label="Value">
                  {new Intl.NumberFormat('en-US').format(entity.value)}
                  <div className="small-meta">at {formatReadAtDate(entity.readAt)}</div>
                </td>
                <td data-label="Min">
                  {new Intl.NumberFormat('en-US').format(entity.minValue)}
                  <div className="small-meta">at {formatReadAtDate(entity.minValueReadAt)}</div>
                </td>
                <td data-label="Max">
                  {new Intl.NumberFormat('en-US').format(entity.maxValue)}
                  <div className="small-meta">at {formatReadAtDate(entity.maxValueReadAt)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Readings;