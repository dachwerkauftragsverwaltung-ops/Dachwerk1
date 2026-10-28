DACHWERK 1 – Aufmaß-Prototyp

Diese ZIP enthält nur die geänderten Dateien:
- index.html
- app.js
- style.css

Einspielen:
1. ZIP entpacken.
2. Diese drei Dateien in den bestehenden GitHub-Repository-Hauptordner hochladen und die gleichnamigen Dateien ersetzen.
3. Commit durchführen und auf GitHub Pages warten.
4. Im Browser neu laden; bei iPhone ggf. alten Tab schließen und neu öffnen.

Enthalten:
- Neuer Menüpunkt „Aufmaß“
- Bestehenden Auftrag auswählen
- Dachfoto vom Gerät aufnehmen/hochladen
- WaveSpeedAI-Auftrag über Supabase Edge Function „dachwerk-technical-drawing“ starten
- Maßlinien mit Pfeilen und frei editierbaren Beschriftungen auf dem Bild
- Aufmaß als PNG herunterladen
- Aufmaß beim Auftrag in Supabase speichern und wieder öffnen/löschen

Voraussetzungen:
- Angemeldeter und freigeschalteter Benutzer für KI-Aufruf und Cloud-Speicherung
- Supabase Storage-Bucket „dachwerk-photos“ muss Upload/Download für freigeschaltete Benutzer erlauben
- Supabase Edge Function „dachwerk-technical-drawing“ und Secret WAVESPEED_API_KEY müssen vorhanden sein

Wichtige Einschränkung der aktuellen Edge Function:
Die bisher bereitgestellte Funktion liefert nur eine predictionId zurück. Sie gibt noch nicht das fertige KI-Bild zurück und unterstützt noch keine Status-/Ergebnisabfrage. Die App zeigt deshalb nach dem Start der KI-Anfrage die Auftrags-ID und erklärt diese Einschränkung; manuelles Aufmaß auf dem Originalfoto funktioniert unabhängig davon.

Das Ergebnis ist eine beschriftete PNG-Bilddatei, keine maßhaltige CAD-Datei/DXF. Maße müssen manuell geprüft/eingetragen werden; aus einem einzelnen Foto lassen sich keine zuverlässigen realen Abmessungen ableiten.
