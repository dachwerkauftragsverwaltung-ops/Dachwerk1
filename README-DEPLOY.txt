DACHWERK – Premium-Anmeldung

Dieses ZIP enthält die Dateien für den GitHub-Pages-Hauptordner.

Einspielen:
1. Vorhandene Dateien im Repository sichern.
2. ALLE Dateien aus diesem ZIP (außer dieser README, falls nicht benötigt) in den Hauptordner des Repositorys Dachwerk.Fertig hochladen und vorhandene Dateien ersetzen.
3. Commit durchführen und warten, bis GitHub Pages veröffentlicht hat.
4. Auf iPhone Safari die Seite neu laden. Bei alter Darstellung ggf. Tab schließen und URL erneut öffnen.

Enthalten:
- Professionelles responsive Login-Layout für Computer und Smartphone
- Passwort-Auge zum Anzeigen/Verbergen
- Kurzer grüner Anmelde-Erfolgseffekt
- Dachdecker-Foto als lokale Datei login-roofer.png
- Bestehende App-, Supabase-, PDF- und Fotospeicher-Dateien aus der bereitgestellten Ausgangsversion

Hinweis: Diese ZIP aktualisiert die Login-Oberfläche. Sie verändert keine Supabase-RLS-Regeln und kann die Funktion auf echten Geräten nicht ersetzen/testen, ohne sie auf GitHub Pages aufzurufen.

NEU: KI-Dachzeichnung (Test)
- Neue UI im Auftrag: Dachfoto auswählen, Dachaufsicht oder Dachansicht wählen, Maße manuell ergänzen und die erzeugte Skizze zur Baustellenfoto-Liste hinzufügen.
- Die Zeichnung wird beim nächsten Klick auf „Auftrag speichern“ wie andere Fotos in dachwerk-photos gespeichert. Die bestehenden Tabellen und Auftragsdatenstruktur werden nicht geändert.
- Voraussetzung: WAVESPEED_API_KEY als Supabase Secret setzen.
- Edge Function deployen: supabase functions deploy dachwerk-technical-drawing
- Konfiguration ist in supabase/config.toml ergänzt (verify_jwt = true).
- Der Aufruf nutzt das WaveSpeedAI-Modell minimax/image-01. API-Antworten/Status können je nach WaveSpeedAI-Konto oder Modellversion abweichen; daher zunächst mit einem Testauftrag prüfen. KI-Zeichnungen sind schematisch und nicht maßstabsgetreu. Maße werden nur manuell als Beschriftung/Metadaten hinterlegt.
