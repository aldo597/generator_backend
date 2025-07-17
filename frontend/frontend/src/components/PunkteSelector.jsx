import React, { useState } from 'react';

function PunkteSelector({ punkte, onPunktSelect }) {
  const [expandedTitles, setExpandedTitles] = useState({});
  const [selectedPunkt, setSelectedPunkt] = useState(null);

  const toggleExpand = (titel) => {
    setExpandedTitles(prev => ({
      ...prev,
      [titel]: !prev[titel],
    }));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedPunkt(value);
    onPunktSelect(value); // Nur Auswahl, kein Bild erzeugen
  };

  return (
    <div>
      <h2>Choose vote:</h2>
      {punkte.map(([titel, unterpunkte]) => (
        <div key={titel}>
          <h4
            onClick={() => toggleExpand(titel)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {titel} {expandedTitles[titel] ? '▼' : '▶'}
          </h4>

          {expandedTitles[titel] && (
            <div style={{ paddingLeft: 20 }}>
              {unterpunkte.map((p, i) => (
                <label key={i} style={{ display: 'block', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="punkte"
                    value={p}
                    checked={selectedPunkt === p}
                    onChange={handleChange}
                  />
                  {p}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PunkteSelector;
