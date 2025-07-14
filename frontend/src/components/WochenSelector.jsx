import React, { useState } from 'react';

function WochenSelector({ wochen, onSelect }) {
  const [selectedWeek, setSelectedWeek] = useState('');

  const handleChange = (event) => {
    const week = event.target.value;
    setSelectedWeek(week);
    onSelect(week);
  };

  return (
    <div>
      <h2>Choose week:</h2>
      <form>
        {wochen.map(w => (
          <label key={w[0]} style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="radio"
              name="week"
              value={w[0]}
              checked={selectedWeek === w[0]}
              onChange={handleChange}
              
            />
            {w[0]}
          </label>
        ))}
      </form>
    </div>
  );
}

export default WochenSelector;

