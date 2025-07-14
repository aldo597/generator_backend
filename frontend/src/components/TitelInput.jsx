import React from 'react';

function TitelInput({ titel, setTitel }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Write titel:</h3>
      <p>Type a whitespace for no title</p>
      <input
        id="titelInput"
        type="text"
        value={titel}
        onChange={e => setTitel(e.target.value)}
        style={{ padding: '8px', width: '100%', maxWidth: '400px', marginTop: '5px' }}
        placeholder="Title for the vote"
      />
    </div>
  );
}

export default TitelInput;
