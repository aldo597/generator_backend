import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WochenSelector from './components/WochenSelector';
import TageSelector from './components/TageSelector';
import PunkteSelector from './components/PunkteSelector';
import TitelInput from './components/TitelInput';
import './App.css';
import logo from './logo_greens.png';
import api from '../api';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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
  const [error, setError] = useState(null);

  // 🔐 Überwache Login-Zustand
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    // Wenn kein User → fertig
    if (!currentUser) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    // Wenn User existiert aber NICHT verifiziert → NICHT einloggen!
    if (!currentUser.emailVerified) {
      setUser(null);             // ⛔ verhindert Weiterleitung
      setLoadingUser(false);
      return;
    }

    // Nur verifizierten User akzeptieren
    setUser(currentUser);
    setLoadingUser(false);
  });

  return unsubscribe;
}, []);


  // Hilfsfunktion, um Axios-Fehler sauber zu verarbeiten
const handleAxiosError = (err) => {
  if (err.response) {
    // Versuche, eigene Meldung vom Server zu verwenden
    const serverMessage = err.response.data?.error;

    if (serverMessage) {
      setError(serverMessage);
    } else if (err.response.status === 404) {
      setError("Ressource nicht gefunden (404).");
    } else if (err.response.status === 500) {
      setError("Interner Serverfehler (500). Bitte versuche es später.");
    } else {
      setError(`Fehler ${err.response.status}`);
    }
  } else if (err.request) {
    setError("Keine Antwort vom Server. Bitte überprüfe deine Verbindung oder versuche es später.");
  } else {
    setError("Fehler beim Senden der Anfrage: " + err.message);
  }
};


  // 📡 Daten laden (nur wenn User eingeloggt)
  useEffect(() => {
    if (!user) return;
    setIsLoadingWochen(true);
    setError(null);

    api.get("/wochen")
      .then(res => setWochen(res.data.wochen))
      .catch(handleAxiosError)
      .finally(() => setIsLoadingWochen(false));
  }, [user]);

  const loadTage = (week) => {
    setSelectedWeek(week);
    setSelectedTag(null);
    setPunkteByTag({});
    setIsLoadingTage(true);
    setIsLoadingPunkte(true);
    setError(null);

    api.get(`/tage?week=${encodeURIComponent(week)}`)
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
            .catch(handleAxiosError)
            .finally(() => {
              remaining -= 1;
              if (remaining === 0) setIsLoadingPunkte(false);
            });
        });
      })
      .catch(handleAxiosError)
      .finally(() => setIsLoadingTage(false));
  };

  const selectTag = (tag) => {
    setSelectedTag(tag);
    setSelectedPunkt(null);
    setImageUrl(null);
  };

  const handlePunktSelect = (punkt) => {
    setSelectedPunkt(punkt);
  };

  const handleGenerateButtonClick = () => {
    if (!selectedPunkt || !selectedTag || !titel) {
      setError("Bitte Tag, Punkt und Titel auswählen");
      return;
    }

    setIsLoading(true);
    setError(null);

    api.post(
      "/bild",
      { punkt: selectedPunkt, tag: selectedTag, titel: titel },
      { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' }
    )
    .then(res => setImageUrl(URL.createObjectURL(res.data)))
    .catch(handleAxiosError)
    .finally(() => setIsLoading(false));
  };

  const punkteFürTagGeladen = punkteByTag[selectedTag] !== undefined;

  if (loadingUser) return <div>Lade Benutzer...</div>;

  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="Logo" className="corner-image" />
        <h1>Votes – Image generator</h1>
        {user && (
          <button
            onClick={() => signOut(auth)}
            className="register_btn"
            
          >
            Logout
          </button>
        )}
      </div>

      {/* Fehleranzeige */}
      {error && (
        <div style={{ color: "red", margin: "10px 0", fontWeight: "bold" }}>
          {error}
        </div>
      )}

      {!user && !loadingUser && <Login onLogin={() => setUser(auth.currentUser)} />}

      {user && (
        <>
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

          {selectedPunkt && <TitelInput titel={titel} setTitel={setTitel} />}

          {selectedPunkt && titel && (
            <button onClick={handleGenerateButtonClick}>
              Generate image
            </button>
          )}

          {isLoading && <div className="loading">Rendering...</div>}

          {imageUrl && !isLoading && (
            <>
              <h2>Generated image:</h2>
              <img src={imageUrl} alt="Abstimmungsergebnis" className="generated-image" />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
