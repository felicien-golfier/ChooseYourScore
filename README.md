 # ChooseYourScore

    A clinical exercise tool for speech therapists and neuropsychologists.

    ## What it does

    Displays pairs of items (words, numbers, symbols) side by side on screen. The patient clicks the correct item
    according to the therapist's instructions. At the end, it reports:

    - Score (correct answers)
    - Number of errors
    - Errors on left item vs right item
    - Total time

    Progress (score, time, date) is tracked over sessions and displayed as a chart per patient.

    ## Item variations

    Each item in a pair can vary independently by:
    - Color
    - Font size
    - Font family
    - Case (uppercase, lowercase, mixed)

    ## Who uses it

    | Role | What they do |
    |---|---|
    | Therapist | Configures exercises (add/edit/delete item pairs and instructions) via the editor panel |
    | Patient | Opens the exercise in a browser and clicks items |

    ## Tech stack

    Pure HTML/CSS/JavaScript — no installation, no server, no dependencies except Chart.js (loaded via CDN).
    Data is stored in the browser's `localStorage`.

    ## Files

    | File | Purpose |
    |---|---|
    | `index.html` | Exercise runner (patient view) |
    | `editor.html` | Exercise editor (therapist view) |
    | `results.html` | Per-patient history and progress charts |

    ## Usage

    1. Open `editor.html` to create or modify an exercise
    2. Open `index.html` to run the exercise with a patient
    3. Open `results.html` to review a patient's progress over time

    No installation required. Works in any modern browser.