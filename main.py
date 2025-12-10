from fastapi import FastAPI, UploadFile, Response, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from logic import *
import uvicorn
from pydantic import BaseModel
import asyncio

class BildRequest(BaseModel):
    punkt: str
    tag: str
    titel: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Globaler Exception-Handler für 500
# -----------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Fehler bei {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Ein interner Serverfehler ist aufgetreten.",
            "details": str(exc)
        }
    )

# -----------------------------
# Beispiel-Route mit Timeout und 404 Handling
# -----------------------------
@app.get("/wochen")
def get_wochen():
    try:
        # Timeout simulieren z. B. bei externem Request
        data = get_weeks_from_text(read_website_text('https://www.europarl.europa.eu/plenary/en/votes.html?tab=votes#banner_session_live'))
        if not data:
            raise HTTPException(status_code=404, detail="Wochen nicht gefunden")
        return {"wochen": data}
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"error": "Die Anfrage hat zu lange gedauert (Timeout)."}
        )

@app.get("/tage")
def get_tage(week: str):
    try:
        url = "https://www.europarl.europa.eu/plenary/en/votes.html?tab=votes#banner_session_live"
        tage = tage_ausgeben(week, read_website_text(url))
        if not tage:
            raise HTTPException(status_code=404, detail=f"Keine Tage für Woche {week} gefunden")
        return {"tage": tage}
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"error": "Die Anfrage hat zu lange gedauert (Timeout)."}
        )

from fastapi.responses import JSONResponse

@app.get("/punkte")
def get_punkte(tag: str):
    try:
        url = "https://www.europarl.europa.eu/plenary/en/votes.html?tab=votes#banner_session_live"
        result = pdf_finden(url, tag)

        if result is None:
            # 404 mit Beschreibung
            return JSONResponse(
                status_code=404,
                content={"error": f"No votes could be found for the day '{tag}'. The EP may not have uploaded the relevant data yet."}
            )

        link, _ = result
        text1 = read_pdf_with_pdfplumber(link)
        struktur = parse_inhaltsverzeichnis(text1)
        return struktur

    except Exception as e:
        print(f"Fehler bei /punkte?tag={tag}: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "An internal server error occured.", "details": str(e)}
        )



@app.post("/bild")
def bild_generieren(body: BildRequest):
    try:
        img_path = process_abstimmung(body.punkt, body.tag, body.titel)
        if not img_path:
            raise HTTPException(status_code=404, detail="Bild konnte nicht generiert werden")
        return FileResponse(img_path, media_type="image/png")
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"error": "Die Bildgenerierung hat zu lange gedauert (Timeout)."}
        )

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8001)),  # Railway gibt PORT automatisch vor
        log_level="info"
    )