from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from logic import *  # Deine Logikfunktionen
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import os
import httpx  # Für asynchrone HTTP-Requests

# ----------------------
# Request Model
# ----------------------
class BildRequest(BaseModel):
    punkt: str
    tag: str
    titel: str  # Debugging / Titel

# ----------------------
# App erstellen & CORS
# ----------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Erlaube alle Domains (für Produktion besser anpassen)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------
# Hilfsfunktion: async Webseite laden
# ----------------------
async def read_website_text_async(url: str) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text

# ----------------------
# Endpoints
# ----------------------
@app.get("/wochen")
async def get_wochen():
    print("Starte /wochen")
    url = "https://www.europarl.europa.eu/plenary/en/votes.html?tab=votes#banner_session_live"
    text = await read_website_text_async(url)
    wochen = get_weeks_from_text(text)  # bleibt synchron
    return {"wochen": wochen}

@app.get("/tage")
async def get_tage(week: str):
    url = "https://www.europarl.europa.eu/plenary/en/votes.html?tab=votes#banner_session_live"
    text = await read_website_text_async(url)
    return {"tage": tage_ausgeben(week, text)}  # bleibt synchron

@app.get("/punkte")
async def get_punkte(tag: str):
    # PDF-Links bleiben synchron (CPU-bound)
    link, _ = pdf_finden(url, tag)
    text1 = read_pdf_with_pdfplumber(link)
    struktur = parse_inhaltsverzeichnis(text1)
    return struktur

@app.post("/bild")
async def bild_generieren(body: BildRequest):
    print("Titel empfangen:", body.titel)
    img_buffer = process_abstimmung(body.punkt, body.tag, body.titel)
    return StreamingResponse(img_buffer, media_type="image/png")

# ----------------------
# Server starten
# ----------------------
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8001)),  # Railway-Port
        log_level="info"
    )
