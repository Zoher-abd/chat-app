# Refactoring-Plan – Aufgabe 8

## 1. Aktueller Zustand und Probleme im Code

Im aktuellen Projekt befinden sich viele verschiedene Aufgaben in derselben Datei
Besonders in der Datei `server.ts` sind mehrere Verantwortlichkeiten vermischt

### Erkannte Probleme:
- **Code-Duplikation**:
  - Ähnliche Logik (z.B. Redirects, Validierungen) kommt in mehreren Routen vor
- **Zu lange Funktionen**:
  - Einige Routen sind sehr lang und machen mehrere Dinge gleichzeitig.
- **Unklare Verantwortlichkeiten**:
  - `server.ts` enthält Routing, Business-Logik und Datenbankzugriffe.
  - `sqlite.ts` enthält sowohl SQL-Logik als auch Login-Logik.

Diese Struktur macht den Code schwerer verständlich und schwerer testbar

---

## 2. Ziel-Architektur (neue Struktur)

Ziel ist es, den Code klar in Schichten aufzuteilen, sodass jede Datei nur eine Aufgabe hat.

### Geplante Schichten:

- **Routes (server.ts)**  
  Registriert die Routen und verbindet sie mit Controllern.

- **Controller**  
  Enthalten die eigentliche Anwendungslogik (z.B. Login, Registrierung, Anzeigen von Daten).

- **Repositories**  
  Enthalten alle Datenbankzugriffe (SQL-Abfragen).

- **Utilities / Middleware**  
  Wiederverwendbare Hilfsfunktionen (Cookies, Flash-Messages, Authentifizierung).

### Abhängigkeitsrichtung:
- Routes → Controller
- Controller → Repositories
- Routes → Middleware / Utilities

Repositories kennen weder Controller noch Express.


## 3. Geplante Refactoring-Schritte

### Schritt 1: Repository-Schicht erstellen
- Auslagern aller Datenbankzugriffe aus `sqlite.ts`
- Neue Dateien für User-, Room- und Message-Zugriffe erstellen

### Schritt 2: Controller erstellen
- Business-Logik aus den Routen auslagern
- Für jede größere Funktionalität einen Controller erstellen (z.B. Login, Chat)

### Schritt 3: Utilities und Middleware sammeln
- Hilfsfunktionen (Cookies, Flash, Redirects) in eigene Dateien auslagern
- Authentifizierungs-Logik als Middleware umsetzen

Nach jedem Schritt wird getestet, ob die Anwendung weiterhin korrekt funktioniert.

---

## 4. Ziel-Verzeichnisstruktur

```text
src/
  controllers/
  repositories/
  middleware/
  utils/
  server.ts
