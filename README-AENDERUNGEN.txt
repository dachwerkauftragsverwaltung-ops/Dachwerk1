DACHWERK1 – Änderungen: Marketing entfernen und Aufmaß-Menü

Dateien ersetzen:
- index.html -> Repository-Stammverzeichnis
- app.js -> Repository-Stammverzeichnis
- supabase/config.toml -> supabase/config.toml

Marketing vollständig aus dem Repository entfernen:
- marketing.js
- README-MARKETING-DACHWERK1.txt
- supabase/functions/dachwerk-marketing/index.ts (und den Ordner dachwerk-marketing)

Die drei obigen Löschungen sind absichtlich nicht als leere Dateien im ZIP enthalten. Bitte diese Dateien/Ordner in GitHub löschen, falls sie dort noch vorhanden sind. Die Supabase-Funktion wurde laut Nutzer bereits gelöscht.

Aufmaß-Menü:
Der neue Menüpunkt „Aufmaß“ öffnet bei einem bereits geöffneten Auftrag dessen KI-Dachzeichnung-Bereich. Wenn noch kein Auftrag geöffnet ist, führt er zur Auftragsübersicht und erklärt, dass zuerst ein Auftrag geöffnet bzw. gespeichert werden muss.

Die bestehende Funktion dachwerk-technical-drawing bleibt in supabase/config.toml mit verify_jwt=true eingetragen.
