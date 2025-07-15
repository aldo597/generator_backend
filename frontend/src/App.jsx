import React, { useEffect, useState } from 'react';

import WochenSelector from './components/WochenSelector';
import TageSelector from './components/TageSelector';
import PunkteSelector from './components/PunkteSelector';
import TitelInput from './components/TitelInput';
import './App.css';
import logo from './grunen_logo_large.png'; // Importiere das Logo
import api from '../api'; // Importiere die API-Konfiguration

function App() {
  const [wochen, setWochen] = useState([]);
  const [tage, setTage] = useState([]);
  const [punkteByTag, setPunkteByTag] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedPunkt, setSelectedPunkt] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWochen, setIsLoadingWochen] = useState(false);
  const [isLoadingTage, setIsLoadingTage] = useState(false);
  const [isLoadingPunkte, setIsLoadingPunkte] = useState(false);
  const [titel, setTitel] = useState('');

  useEffect(() => {
    setIsLoadingWochen(true);
    api.get("/wochen")
      .then(res => setWochen(res.data.wochen))
      .finally(() => setIsLoadingWochen(false));
  }, []);

  const loadTage = (week) => {
    setSelectedWeek(week);
    setSelectedTag(null);
    setPunkteByTag({});
    setIsLoadingTage(true);
    setIsLoadingPunkte(true);

    api.get(`/tage?week=${week}`)
      .then(res => {
        const tageListe = res.data.tage;
        setTage(tageListe);

        let remaining = tageListe.length;

        tageListe.forEach(tag => {
          api.get(`/punkte?tag=${encodeURIComponent(tag)}`)
            .then(res => {
              setPunkteByTag(prev => ({
                ...prev,
                [tag]: Object.entries(res.data)
              }));
            })
            .catch(err => console.error("Fehler beim Laden der Punkte für Tag:", tag, err))
            .finally(() => {
              remaining -= 1;
              if (remaining === 0) setIsLoadingPunkte(false);
            });
        });
      })
      .finally(() => setIsLoadingTage(false));
  };

  const selectTag = (tag) => {
    setSelectedTag(tag);
    setSelectedPunkt(null);
    setImageUrl(null);
  };

  // Neu: Speichere den ausgewählten Punkt (wird von PunkteSelector aufgerufen)
  const handlePunktSelect = (punkt) => {
    setSelectedPunkt(punkt);
    // Optional: Image nicht sofort generieren, sondern erst später auf Button
    // setImageUrl(null); // falls gewünscht, vorheriges Bild löschen
  };

  // Neu: Generiere das Bild erst auf Knopfdruck mit gespeichertem Titel und Punkt
  const handleGenerateButtonClick = () => {
    if (!selectedPunkt || !selectedTag || !titel) {
      alert('Bitte Tag, Punkt und Titel auswählen');
      return;
    }
    setIsLoading(true);
    api.post(
      '/bild',
      {
        punkt: selectedPunkt,
        tag: selectedTag,
        titel: titel
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    )
    .then(res => {
      const imgURL = URL.createObjectURL(res.data);
      setImageUrl(imgURL);
    }).catch(err => {
      console.error("Fehler beim Generieren des Bildes:", err);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const punkteFürTagGeladen = punkteByTag[selectedTag] !== undefined;

  return (
    <div className="container">
    <div className="header">
      <img
        src={logo} // Passe den Pfad an dein Bild an
        alt="Logo"
        className="corner-image"
      />
      <h1>Votes – Image generator</h1>
      
    </div>
      {isLoadingWochen && <div className="loading">Loading...</div>}

      <WochenSelector wochen={wochen} onSelect={loadTage} />

      {isLoadingTage && <div className="loading">Loading...</div>}

      {tage.length > 0 && (
        <TageSelector
          tage={tage}
          selectedTag={selectedTag}
          onSelect={selectTag}
        />
      )}

      {isLoadingPunkte && !punkteFürTagGeladen && (
        <div className="loading">Loading...</div>
      )}

      {selectedTag && punkteFürTagGeladen && (
        <PunkteSelector
          punkte={punkteByTag[selectedTag]}
          onPunktSelect={handlePunktSelect}
        />
      )}

      {/* TitelInput nur anzeigen, wenn ein Punkt ausgewählt ist */}
      {selectedPunkt && (
        <TitelInput titel={titel} setTitel={setTitel} />
      )}

      {/* Button zum Bild generieren nur zeigen, wenn Punkt und Titel gesetzt sind */}
      {selectedPunkt && titel && (
        <button onClick={handleGenerateButtonClick}>
          Generate image
        </button>
      )}

      {isLoading && (
        <div className="loading">Rendering...</div>
      )}

      {imageUrl && !isLoading && (
        <>
          <h2>Generated image:</h2>
          <img src={imageUrl} alt="Abstimmungsergebnis" className="generated-image" />
        </>
      )}
    </div>
  );
}

export default App;
