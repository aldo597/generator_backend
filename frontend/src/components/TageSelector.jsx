import React, { useEffect } from 'react';

function TageSelector({ tage, selectedTag, onSelect }) {
  useEffect(() => {
    if (tage.length > 0 && !selectedTag) {
      onSelect(tage[0]); // Default auswählen, falls noch keiner gesetzt
    }
  }, [tage, selectedTag, onSelect]);

  return (
    <div>
      <h2>Choose day:</h2>
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #ccc', paddingBottom: '5px' }}>
        {tage.map(tag => (
          <div
            key={tag}
            onClick={() => onSelect(tag)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: selectedTag === tag ? '2px solid blue' : '2px solid transparent',
              fontWeight: selectedTag === tag ? 'bold' : 'normal',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TageSelector;
