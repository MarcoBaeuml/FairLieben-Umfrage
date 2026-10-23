# FairLieben – Umfrage

Anonyme Umfrage mit Freitextantworten auf Cloudflare Workers + D1. Die Antworten werden **im Browser**
verschlüsselt. Server, Datenbank und Cloudflare sehen nur Ciphertext. Entschlüsselt wird ausschließlich
lokal mit `auswertung/auswertung.html` und dem Private Key.

## Ablauf

1. Teilnehmer geben das Umfrage-Passwort ein (`/login`), wählen auf `/` ihre Gruppe und beantworten die Fragen auf deren Seite (z. B. `/maedchen`).
2. Der Browser verschlüsselt alle Antworten einer Abgabe als einen Block:
   AES-256-GCM mit zufälligem Schlüssel pro Abgabe, dieser Schlüssel wird mit RSA-OAEP (SHA-256) und
   dem Public Key verschlüsselt.
3. Der Worker speichert den Block in D1 (`responses`), ohne IP oder sonstige Metadaten, nur mit Zeitstempel.
4. Unter `/admin` (eigenes Admin-Passwort) lädst du den verschlüsselten Export als JSON herunter.
5. `auswertung/auswertung.html` lokal öffnen, Private Key und Export laden: Die Antworten werden nach
   Abschnitt und Frage gruppiert und in zufälliger Reihenfolge angezeigt. Von dort aus kannst du eine CSV herunterladen
   oder per „Als PDF drucken“ ein PDF erzeugen.

## Fragen bearbeiten

Die Fragen liegen in der D1-Datenbank (Tabellen `questions` und `settings`) und werden erst nach dem
Umfrage-Login ausgeliefert. Sie stehen weder im Repo noch im Code des Workers.

Gepflegt werden sie in `fragen.md` (bewusst **nicht im Repo**, siehe `.gitignore`) und dann mit einem Skript
in die Datenbank übertragen. Als Vorlage dient [`fragen.example.md`](fragen.example.md):

```sh
cp fragen.example.md fragen.md
yarn fragen
```

`yarn fragen` zeigt eine Übersicht und fragt dann:

1. **Welche Datenbank?** lokal (für `yarn dev`) oder remote (die echte bei Cloudflare)
2. **Vorher löschen oder ergänzen?** Beim Ergänzen werden nur Fragen eingetragen, die es so noch nicht gibt.
   Neue Fragen erscheinen am Ende ihres Abschnitts.
3. **Fortfahren?**

Titel und Einleitung werden immer aus der Datei übernommen. Abgegebene Antworten bleiben unberührt, sie
enthalten den Fragetext ohnehin selbst. Ohne Rückfragen geht es mit
`yarn fragen --remote --append` bzw. `--local --replace`.

Aufbau:

```md
# Titel

Kurze Einleitung (optional).

## Mädchen

### Fragen von Jungs an Mädchen

1. Erste Frage?
2. Zweite Frage?

### Fragen von Mädchen an Mädchen

1. …

## Jungs

### Fragen von Mädchen an Jungs

1. …
```

`##` ist eine Zielgruppe: Sie erscheint als Auswahl auf der Startseite und bekommt eine eigene Seite
(„Mädchen“ → `/maedchen`). `###` ist ein Abschnitt, die
Abschnitte erscheinen in der Reihenfolge aus der Datei. Jede Frage ist ein Freitextfeld. Abschnitte ohne Fragen werden ausgeblendet. Zielgruppe, Abschnitt und
Fragetext werden mitverschlüsselt. Ändert sich `fragen.md` später, bleiben alte Antworten trotzdem richtig
zugeordnet.

## Einrichtung

### Schlüsselpaar erzeugen

Der Public Key wird **einzeilig** verwendet (Base64, ohne `-----BEGIN…`-Zeilen) und kommt in die
Umgebungsvariable `PUBLIC_KEY` (siehe unten). Zwei Wege:

- **`auswertung/auswertung.html`** öffnen, „Neues Schlüsselpaar erzeugen“: Der Private Key wird als
  `private-key.pem` heruntergeladen, der Public Key erscheint als eine Zeile mit „Kopieren“-Button. Für einen
  vorhandenen Private Key zeigt „Zugehörigen Public Key anzeigen“ dieselbe Zeile an.
- **OpenSSL**, in einem Ordner außerhalb des Projekts:

  ```sh
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out private-key.pem
  openssl pkey -in private-key.pem -pubout -outform DER | base64 | tr -d '\n'   # gibt den Public Key einzeilig aus
  ```

**Den Private Key nie ins Repo legen** und sicher aufbewahren (z. B. im Passwortmanager). Ohne ihn sind die
Antworten verloren.

### Lokal entwickeln

```sh
yarn install
cp .dev.vars.example .dev.vars          # Passwörter und PUBLIC_KEY (einzeilig) eintragen
yarn wrangler d1 migrations apply DB --local
cp fragen.example.md fragen.md          # echte Fragen eintragen
yarn fragen --local
yarn dev
```

### Deployment

```sh
yarn wrangler d1 create fair-lieben  # ausgegebene database_id in wrangler.jsonc eintragen
yarn wrangler d1 migrations apply DB --remote
yarn wrangler secret put SURVEY_PASSWORD   # Passwort für die Umfrage
yarn wrangler secret put ADMIN_PASSWORD    # Passwort für /admin
yarn wrangler secret put PUBLIC_KEY        # einzeiligen Public Key einfügen
yarn fragen --remote
yarn deploy
```

## Auswertung

`auswertung/auswertung.html` per Doppelklick im Browser öffnen. Die Datei lädt nichts aus dem Internet
und sendet nichts. Eine Content-Security-Policy blockiert ausgehende Verbindungen. Der Private Key muss
unverschlüsseltes PKCS#8 sein (`-----BEGIN PRIVATE KEY-----`), wie ihn die Befehle oben erzeugen.

## Passwörter

- `SURVEY_PASSWORD` schützt die Umfrage (Startseite, Fragen, Absenden), `ADMIN_PASSWORD` den Bereich `/admin`.
  `/verschluesselung` ist ohne Passwort erreichbar.
- Nach der Eingabe merkt sich der Browser den Zugang per Cookie (Umfrage 30 Tage, Admin 8 Stunden).
- Wird ein Passwort geändert (`wrangler secret put …`), sind alle bisherigen Anmeldungen automatisch ungültig.

## Grenzen

- Der Code der Website wird von Cloudflare ausgeliefert. Wer Zugriff auf das Cloudflare-Konto oder das
  Deployment hat, könnte den Public Key austauschen und künftige Antworten mitlesen. Bereits gespeicherte
  Antworten bleiben geschützt.
- Mehrfachabgaben sind möglich und gewollt. Es gibt keinen Spam-Schutz außer Größenlimits (z. B. später
  Cloudflare Turnstile oder Rate Limiting ergänzen).
