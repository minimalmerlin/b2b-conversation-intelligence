export type TrackId = "web" | "js" | "python";
export type ExerciseLanguage = "html" | "javascript" | "python";

export type ExerciseCheck =
  | {
      kind: "contains";
      needles: string[];
      caseSensitive?: boolean;
    }
  | {
      kind: "js_console_includes";
      expected: string;
    }
  | {
      kind: "python_stdout_includes";
      expected: string;
    };

export type Exercise = {
  language: ExerciseLanguage;
  title: string;
  instructionsMd: string;
  starterCode: string;
  check: ExerciseCheck;
  hintMd?: string;
  solutionCode?: string;
};

export type Lesson = {
  id: string;
  trackId: TrackId;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  contentMd: string;
  exercise: Exercise;
};

export type Track = {
  id: TrackId;
  title: string;
  description: string;
  color: "indigo" | "emerald" | "amber";
  recommendedAge: string;
  lessons: Lesson[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  trackIds: TrackId[];
  difficulty: "leicht" | "mittel" | "knifflig";
  deliverable: string;
};

const WEB: Track = {
  id: "web",
  title: "Web‑Explorer (HTML & CSS)",
  description:
    "Baue deine ersten Webseiten: Überschriften, Bilder, Links und erstes Styling.",
  color: "indigo",
  recommendedAge: "ab ca. 8–12 (mit Hilfe) / 10+ (selbstständig)",
  lessons: [
    {
      id: "web-01",
      trackId: "web",
      title: "Was ist HTML?",
      summary: "Dein erstes Mini‑Dokument mit Überschrift und Text.",
      minutes: 12,
      xp: 40,
      contentMd:
        "HTML ist wie der **Bauplan** einer Webseite.\n\n- `h1` ist eine große Überschrift\n- `p` ist ein Absatz\n\nIn dieser Quest schreibst du deine erste kleine Seite.",
      exercise: {
        language: "html",
        title: "Baue deine erste Seite",
        instructionsMd:
          "1) Schreibe eine Überschrift mit deinem Namen.\n2) Schreibe darunter einen Absatz mit einem Satz über dich.\n\nTipp: Nutze `<h1>...</h1>` und `<p>...</p>`.",
        starterCode:
          "<h1>Hallo!</h1>\n<p>Ich lerne Programmieren.</p>\n",
        check: { kind: "contains", needles: ["<h1", "</h1>", "<p", "</p>"] },
        hintMd:
          "Du kannst den Text **zwischen** die Tags schreiben.\n\nBeispiel: `<h1>Dein Text</h1>`",
        solutionCode:
          "<h1>Ich bin Alex</h1>\n<p>Heute starte ich meine Code‑Reise!</p>\n",
      },
    },
    {
      id: "web-02",
      trackId: "web",
      title: "Links & Bilder",
      summary: "Mach deine Seite klickbar und bunt.",
      minutes: 15,
      xp: 50,
      contentMd:
        "Mit Links kannst du zu anderen Seiten springen.\n\n- Link: `<a href=\"...\"></a>`\n- Bild: `<img src=\"...\" alt=\"...\" />`\n\nWir nutzen ein Bild aus dem Internet. (Eltern: wenn ihr wollt, ersetzt es später durch ein eigenes Bild in `public/`.)",
      exercise: {
        language: "html",
        title: "Ein Link + ein Bild",
        instructionsMd:
          "1) Erstelle einen Link zu `https://developer.mozilla.org/` mit Link‑Text **MDN**.\n2) Füge ein Bild ein.\n\nDu kannst dieses Bild nutzen:\n`https://picsum.photos/seed/codequest/640/240`",
        starterCode:
          "<h1>Meine Links</h1>\n\n<!-- Link hier -->\n\n<!-- Bild hier -->\n",
        check: {
          kind: "contains",
          needles: ["<a", "href=", "developer.mozilla.org", "</a>", "<img"],
        },
        hintMd:
          "Ein Bild braucht ein `src` (Quelle) und ein `alt` (Beschreibung).",
        solutionCode:
          "<h1>Meine Links</h1>\n<p><a href=\"https://developer.mozilla.org/\">MDN</a></p>\n<img src=\"https://picsum.photos/seed/codequest/640/240\" alt=\"Ein zufälliges Bild\" />\n",
      },
    },
    {
      id: "web-03",
      trackId: "web",
      title: "Listen & Struktur",
      summary: "Ordne Informationen mit Listen.",
      minutes: 12,
      xp: 45,
      contentMd:
        "Listen sind super, um Dinge übersichtlich zu machen.\n\n- Ungeordnete Liste: `<ul>` mit `<li>`\n- Geordnete Liste: `<ol>` mit `<li>`",
      exercise: {
        language: "html",
        title: "Deine 3 Lieblings‑Dinge",
        instructionsMd:
          "Erstelle eine Liste mit 3 Dingen, die du magst (z.B. Spiele, Pizza, Fußball).",
        starterCode:
          "<h1>Meine Lieblings‑Dinge</h1>\n\n<!-- Liste hier -->\n",
        check: { kind: "contains", needles: ["<ul", "<li", "</li>", "</ul>"] },
        solutionCode:
          "<h1>Meine Lieblings‑Dinge</h1>\n<ul>\n  <li>Pizza</li>\n  <li>Videospiele</li>\n  <li>Fußball</li>\n</ul>\n",
      },
    },
    {
      id: "web-04",
      trackId: "web",
      title: "Erstes CSS",
      summary: "Mach deine Seite schöner: Farben, Abstände, Schrift.",
      minutes: 18,
      xp: 60,
      contentMd:
        "CSS ist die **Kleidung** deiner Webseite.\n\nWir nutzen hier ein `<style>`‑Tag. Später würdest du CSS meist in einer eigenen Datei schreiben.",
      exercise: {
        language: "html",
        title: "Style‑Upgrade",
        instructionsMd:
          "1) Füge ein `<style>`‑Tag hinzu.\n2) Setze den Hintergrund auf eine helle Farbe.\n3) Mach die Überschrift farbig.\n\nBeispiel:\n```html\n<style>\n  body { background: #f0f9ff; }\n  h1 { color: #1d4ed8; }\n</style>\n```",
        starterCode:
          "<h1>Meine bunte Seite</h1>\n<p>CSS macht Webseiten hübsch.</p>\n",
        check: { kind: "contains", needles: ["<style", "body", "background"] },
        hintMd:
          "CSS‑Regeln sehen so aus: `selector { eigenschaft: wert; }`",
        solutionCode:
          "<style>\n  body { background: #f0f9ff; font-family: system-ui; padding: 24px; }\n  h1 { color: #1d4ed8; }\n  p { color: #0f172a; }\n</style>\n\n<h1>Meine bunte Seite</h1>\n<p>CSS macht Webseiten hübsch.</p>\n",
      },
    },
    {
      id: "web-05",
      trackId: "web",
      title: "Mini‑Projekt: Steckbrief",
      summary: "Baue eine kleine Profil‑Seite mit allem, was du gelernt hast.",
      minutes: 25,
      xp: 90,
      contentMd:
        "Zeit für ein erstes Projekt.\n\n**Ziel:** Eine Steckbrief‑Seite mit Überschrift, Bild, Liste und etwas CSS.\n\nWenn du fertig bist, kannst du sie deinen Eltern zeigen.",
      exercise: {
        language: "html",
        title: "Steckbrief‑Seite",
        instructionsMd:
          "Deine Seite soll enthalten:\n- eine Überschrift\n- ein Bild\n- eine Liste mit 3 Fakten\n- ein bisschen CSS\n\nBonus: Baue einen Link zu deiner Lieblingsseite ein.",
        starterCode:
          "<style>\n  body { font-family: system-ui; padding: 24px; }\n  .card { max-width: 720px; margin: 0 auto; padding: 20px; border-radius: 16px; background: #ffffff; }\n</style>\n\n<div class=\"card\">\n  <h1>Steckbrief</h1>\n  <!-- Bild -->\n  <p>Hi! Ich bin ...</p>\n  <!-- Liste -->\n  <!-- Link -->\n</div>\n",
        check: {
          kind: "contains",
          needles: ["<style", "<h1", "<img", "<li"],
        },
        hintMd:
          "Wenn du kein eigenes Bild hast, nutze wieder `https://picsum.photos/...`.",
      },
    },
  ],
};

const JS: Track = {
  id: "js",
  title: "JavaScript‑Quest",
  description:
    "Lerne Logik: Variablen, Bedingungen, Schleifen und Funktionen – und baue kleine Spiele.",
  color: "emerald",
  recommendedAge: "ab ca. 10–14",
  lessons: [
    {
      id: "js-01",
      trackId: "js",
      title: "Hello JavaScript",
      summary: "Deine ersten Befehle mit `console.log`.",
      minutes: 12,
      xp: 45,
      contentMd:
        "JavaScript ist die **Magie** im Browser.\n\nMit `console.log(...)` kannst du Text ausgeben – so wie ein Tagebuch für dein Programm.",
      exercise: {
        language: "javascript",
        title: "Sag Hallo!",
        instructionsMd:
          "Gib genau diesen Text aus:\n\n`Hallo, CodeQuest!`",
        starterCode: 'console.log("Hallo, Welt!");\n',
        check: { kind: "js_console_includes", expected: "Hallo, CodeQuest!" },
        hintMd:
          "Achte auf Groß/Kleinschreibung und Satzzeichen – Computer sind da streng.",
        solutionCode: 'console.log("Hallo, CodeQuest!");\n',
      },
    },
    {
      id: "js-02",
      trackId: "js",
      title: "Variablen",
      summary: "Speichere Werte in einer Kiste mit Namen.",
      minutes: 15,
      xp: 55,
      contentMd:
        "Eine Variable ist wie eine **beschriftete Box**.\n\n```js\nconst name = \"Mila\";\n```\n\nDann kannst du sie benutzen:",
      exercise: {
        language: "javascript",
        title: "Dein Name als Variable",
        instructionsMd:
          "1) Lege `const name = \"...\"` an.\n2) Gib `Hallo, <name>!` aus.",
        starterCode: "// Schreibe hier deinen Code\n",
        check: { kind: "js_console_includes", expected: "Hallo," },
        hintMd:
          "Du kannst Strings zusammenkleben:\n\n```js\nconsole.log(\"Hallo, \" + name + \"!\");\n```",
      },
    },
    {
      id: "js-03",
      trackId: "js",
      title: "Wenn‑Dann (if/else)",
      summary: "Dein Programm trifft Entscheidungen.",
      minutes: 18,
      xp: 65,
      contentMd:
        "Bedingungen sind wie Weggabelungen in einem Abenteuer.\n\n```js\nif (punkte >= 10) {\n  console.log(\"Level up!\");\n} else {\n  console.log(\"Weiter sammeln!\");\n}\n```",
      exercise: {
        language: "javascript",
        title: "Schlüssel gefunden?",
        instructionsMd:
          "1) Erstelle `const hasKey = true;`\n2) Wenn `hasKey` true ist, gib `Tür geöffnet!` aus, sonst `Schlüssel fehlt.`",
        starterCode: "const hasKey = true;\n\n// if/else hier\n",
        check: { kind: "js_console_includes", expected: "Tür geöffnet!" },
        hintMd: "Vergiss die geschweiften Klammern `{ }` nicht.",
      },
    },
    {
      id: "js-04",
      trackId: "js",
      title: "Schleifen (for)",
      summary: "Wiederhole Dinge – ohne sie 100× zu schreiben.",
      minutes: 18,
      xp: 70,
      contentMd:
        "Schleifen sind perfekt für Zählen, Listen oder Wiederholungen.\n\n```js\nfor (let i = 1; i <= 3; i++) {\n  console.log(i);\n}\n```",
      exercise: {
        language: "javascript",
        title: "Countdown",
        instructionsMd: "Zähle von 3 runter bis 1 und gib danach `Start!` aus.",
        starterCode: "// for-Schleife hier\n",
        check: { kind: "js_console_includes", expected: "Start!" },
        hintMd: "Du kannst von 3 runterzählen: `i--`",
      },
    },
    {
      id: "js-05",
      trackId: "js",
      title: "Funktionen",
      summary: "Baue eigene Zaubersprüche (wiederverwendbare Schritte).",
      minutes: 20,
      xp: 80,
      contentMd:
        "Funktionen sind **Bauklötze**. Du gibst ihnen einen Namen und rufst sie auf.\n\n```js\nfunction greet(name) {\n  console.log(\"Hi \" + name);\n}\n```\n",
      exercise: {
        language: "javascript",
        title: "Eine Begrüßungs‑Funktion",
        instructionsMd:
          "Schreibe eine Funktion `greet(name)` die `Hi <name>!` ausgibt.\n\nRufe sie am Ende mit `greet(\"Sam\")` auf.",
        starterCode: "// function greet(...) { ... }\n\n// Aufruf hier\n",
        check: { kind: "js_console_includes", expected: "Hi Sam!" },
        hintMd:
          "Achte auf den Funktionsaufruf am Ende – sonst passiert nichts.",
      },
    },
    {
      id: "js-06",
      trackId: "js",
      title: "Mini‑Projekt: Zahlen‑Quiz",
      summary: "Baue ein kleines Quiz in der Konsole.",
      minutes: 25,
      xp: 95,
      contentMd:
        "Projektzeit!\n\n**Ziel:** Du rechnest eine Zahl aus und gibst am Ende eine Nachricht aus.\n\n(Später bauen wir daraus ein richtiges Browser‑Spiel.)",
      exercise: {
        language: "javascript",
        title: "Quiz‑Auswertung",
        instructionsMd:
          "1) Setze `const points = 7;`\n2) Wenn `points >= 5`, gib `Du hast gewonnen!` aus, sonst `Nochmal!`",
        starterCode: "const points = 7;\n\n// if/else hier\n",
        check: { kind: "js_console_includes", expected: "Du hast gewonnen!" },
      },
    },
  ],
};

const PY: Track = {
  id: "python",
  title: "Python‑Playground",
  description:
    "Python ist perfekt für Logik, kleine Games und später auch Daten/Roboter/AI.",
  color: "amber",
  recommendedAge: "ab ca. 10–15",
  lessons: [
    {
      id: "py-01",
      trackId: "python",
      title: "Hello Python",
      summary: "Dein erstes `print()`.",
      minutes: 12,
      xp: 45,
      contentMd:
        "Python ist eine Sprache, die sich sehr **lesbar** anfühlt.\n\nAusgeben geht so:\n\n```py\nprint(\"Hallo!\")\n```",
      exercise: {
        language: "python",
        title: "Sag Hallo!",
        instructionsMd: "Gib diesen Text aus: `Hallo aus Python!`",
        starterCode: "print('Hallo!')\n",
        check: {
          kind: "python_stdout_includes",
          expected: "Hallo aus Python!",
        },
        solutionCode: "print('Hallo aus Python!')\n",
      },
    },
    {
      id: "py-02",
      trackId: "python",
      title: "Variablen",
      summary: "Speichere Werte und nutze sie später.",
      minutes: 15,
      xp: 55,
      contentMd:
        "Variablen sind Namen für Werte:\n\n```py\nname = \"Mila\"\nprint(name)\n```",
      exercise: {
        language: "python",
        title: "Dein Name",
        instructionsMd:
          "1) Setze `name = \"...\"`.\n2) Gib `Ich heiße <name>` aus.",
        starterCode: "# code hier\n",
        check: { kind: "python_stdout_includes", expected: "Ich heiße" },
        hintMd:
          "Strings kannst du zusammenbauen mit `+`:\n\n```py\nprint(\"Ich heiße \" + name)\n```",
      },
    },
    {
      id: "py-03",
      trackId: "python",
      title: "if/else",
      summary: "Dein Programm entscheidet.",
      minutes: 18,
      xp: 65,
      contentMd:
        "Bedingungen:\n\n```py\nif level >= 3:\n    print(\"Bosskampf!\")\nelse:\n    print(\"Weiter laufen\")\n```",
      exercise: {
        language: "python",
        title: "Energie‑Check",
        instructionsMd:
          "Setze `energy = 8`.\nWenn `energy >= 5`, gib `Los geht's!` aus, sonst `Pause.`",
        starterCode: "energy = 8\n\n# if/else hier\n",
        check: { kind: "python_stdout_includes", expected: "Los geht's!" },
        hintMd:
          "Achte auf Einrückung (4 Leerzeichen) unter `if` und `else`.",
      },
    },
    {
      id: "py-04",
      trackId: "python",
      title: "Schleifen (for)",
      summary: "Wiederhole Dinge.",
      minutes: 18,
      xp: 70,
      contentMd:
        "In Python sind Schleifen super lesbar:\n\n```py\nfor i in range(1, 4):\n    print(i)\n```",
      exercise: {
        language: "python",
        title: "Sammle Münzen",
        instructionsMd:
          "Schreibe eine Schleife, die `Münze!` drei Mal ausgibt und danach `Fertig!`.",
        starterCode: "# for-Schleife hier\n",
        check: { kind: "python_stdout_includes", expected: "Fertig!" },
      },
    },
    {
      id: "py-05",
      trackId: "python",
      title: "Listen",
      summary: "Mehrere Dinge in einer Box.",
      minutes: 20,
      xp: 80,
      contentMd:
        "Listen speichern mehrere Werte:\n\n```py\nitems = [\"Schwert\", \"Schild\", \"Trank\"]\nprint(items[0])\n```",
      exercise: {
        language: "python",
        title: "Inventar",
        instructionsMd:
          "1) Erstelle eine Liste `inventory` mit genau diesen Items (in dieser Reihenfolge):\n\n`[\"Schwert\", \"Schild\", \"Trank\"]`\n\n2) Gib das erste Item aus.",
        starterCode: "inventory = [\"Schwert\", \"Schild\", \"Trank\"]\n\n# Gib das erste Item aus:\n",
        check: { kind: "python_stdout_includes", expected: "Schwert" },
        hintMd:
          "Index 0 ist das **erste** Element.\n\n`print(inventory[0])`",
        solutionCode:
          "inventory = [\"Schwert\", \"Schild\", \"Trank\"]\nprint(inventory[0])\n",
      },
    },
    {
      id: "py-06",
      trackId: "python",
      title: "Mini‑Projekt: Text‑Adventure",
      summary: "Baue eine kleine Story mit Entscheidungen.",
      minutes: 30,
      xp: 110,
      contentMd:
        "Projektzeit!\n\n**Ziel:** Du gibst eine kleine Story aus und nutzt mindestens eine Bedingung.\n\nIn der echten Welt würdest du später auch `input()` nutzen – im Browser‑Python lassen wir das hier weg und simulieren Entscheidungen mit Variablen.",
      exercise: {
        language: "python",
        title: "Dein Adventure‑Start",
        instructionsMd:
          "1) Setze `path = \"wald\"` oder `\"burg\"`.\n2) Wenn `path == \"wald\"`, gib `Du gehst in den Wald.` aus, sonst `Du gehst zur Burg.`\n3) Gib am Ende `Ende.` aus.",
        starterCode: "path = \"wald\"\n\n# if/else hier\n",
        check: { kind: "python_stdout_includes", expected: "Ende." },
      },
    },
  ],
};

export const TRACKS: Track[] = [WEB, JS, PY];

export function getTrack(trackId: TrackId): Track {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) {
    throw new Error(`Unknown trackId: ${trackId}`);
  }
  return track;
}

export function getLesson(trackId: TrackId, lessonId: string): Lesson {
  const track = getTrack(trackId);
  const lesson = track.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId: ${lessonId} (trackId: ${trackId})`);
  }
  return lesson;
}

export const PROJECTS: Project[] = [
  {
    id: "project-profile",
    title: "Meine persönliche Homepage",
    description:
      "Eine kleine Homepage über dich (Bild, Links, Listen, Styling).",
    skills: ["HTML-Struktur", "CSS-Farben & Abstände", "Saubere Inhalte"],
    trackIds: ["web"],
    difficulty: "leicht",
    deliverable: "Eine Webseite (1 Seite) als `index.html`-Idee.",
  },
  {
    id: "project-quiz",
    title: "Quiz-Spiel",
    description:
      "Ein Multiple-Choice-Quiz (später mit Buttons im Browser).",
    skills: ["Variablen", "if/else", "Punkte zählen"],
    trackIds: ["js"],
    difficulty: "mittel",
    deliverable: "Ein lauffähiges Quiz (Konsole oder Browser).",
  },
  {
    id: "project-adventure",
    title: "Text-Adventure",
    description: "Eine Story, die sich je nach Entscheidung verändert.",
    skills: ["if/else", "Strings", "Listen"],
    trackIds: ["python"],
    difficulty: "mittel",
    deliverable: "Ein Python-Skript, das eine Story ausgibt.",
  },
  {
    id: "project-capstone",
    title: "Capstone: Mini‑Spiel im Browser",
    description:
      "Ein kleines Browser-Spiel (z.B. Klick-Zähler, Reaktionsspiel oder Memory-Light).",
    skills: ["HTML UI", "JS Events", "State/Variablen", "Design"],
    trackIds: ["web", "js"],
    difficulty: "knifflig",
    deliverable: "Eine kleine spielbare Seite im Browser.",
  },
];
