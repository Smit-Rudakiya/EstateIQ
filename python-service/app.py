"""
EstateIQ – NLP Document Analysis Microservice
Flask API that extracts text from PDF/DOCX files and runs real‑estate‑specific
NLP analysis using spaCy NER + rule‑based clause/warning detection.
"""

import os, re, json, tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── PDF / DOCX parsers ──────────────────────────────────────────────
import pdfplumber
from docx import Document as DocxDocument

# ── spaCy NLP ────────────────────────────────────────────────────────
import spacy

app = Flask(__name__)
CORS(app)

# ── Load spaCy model (download automatically if missing) ────────────
MODEL_NAME = "en_core_web_sm"
try:
    nlp = spacy.load(MODEL_NAME)
except OSError:
    from spacy.cli import download
    download(MODEL_NAME)
    nlp = spacy.load(MODEL_NAME)


# =====================================================================
#  TEXT EXTRACTION
# =====================================================================
def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF using pdfplumber."""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    """Extract all text from a DOCX using python‑docx."""
    doc = DocxDocument(file_path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


# =====================================================================
#  NLP ANALYSIS
# =====================================================================

# Keywords / phrases that signal potential warnings in real estate docs
WARNING_PATTERNS = [
    (r"penalty|penalties", "The document mentions penalties – review the terms carefully."),
    (r"terminate|termination", "A termination clause is present – check notice period and conditions."),
    (r"non[- ]?refundable", "Non-refundable charges are mentioned – verify the amounts."),
    (r"hidden\s+(?:cost|fee|charge)", "The document may reference hidden costs or fees."),
    (r"force\s+majeure", "A Force Majeure clause is included – review scope of events covered."),
    (r"lien|encumbrance", "Liens or encumbrances are mentioned – confirm property title status."),
    (r"escalation\s+clause", "An escalation clause is present – check how and when it activates."),
    (r"default", "Default conditions are described – understand consequences of non-compliance."),
    (r"indemnif", "Indemnification language is present – review liability exposure."),
    (r"waive|waiver", "A waiver clause exists – confirm what rights you may be giving up."),
    (r"arbitration|dispute\s+resolution", "An arbitration / dispute resolution clause is included."),
]

CLAUSE_PATTERNS = [
    (r"(?:rent|lease|monthly)\s+(?:amount|payment|fee|price)[:\s]*[\$₹]?\s*[\d,]+", "Rent / Payment Clause"),
    (r"(?:security|earnest)\s+(?:deposit|money)[:\s]*[\$₹]?\s*[\d,]+", "Security Deposit Clause"),
    (r"(?:term|duration|period)\s+(?:of|for)?\s*(?:lease|agreement|contract)", "Term / Duration Clause"),
    (r"(?:maintenance|repair)\s+(?:charge|cost|fee|responsibilit)", "Maintenance Clause"),
    (r"(?:insurance|insured)", "Insurance Clause"),
    (r"(?:possession|handover|delivery)\s+date", "Possession / Handover Clause"),
    (r"(?:carpet|built[- ]?up|super\s+built[- ]?up)\s+area", "Area Specification Clause"),
    (r"(?:parking|garage|basement)", "Parking / Garage Clause"),
]


def analyze_text(text: str) -> dict:
    """Run NLP entity extraction + rule‑based clause & warning detection."""

    doc = nlp(text[:100000])  # limit to ~100k chars for speed

    # ── Named entities of interest ──────────────────────────────────
    entities = {}
    target_labels = {"MONEY", "DATE", "ORG", "PERSON", "GPE", "LAW", "CARDINAL", "PERCENT"}
    for ent in doc.ents:
        if ent.label_ in target_labels:
            entities.setdefault(ent.label_, [])
            val = ent.text.strip()
            if val and val not in entities[ent.label_]:
                entities[ent.label_].append(val)
    # De-duplicate and cap each label to 15 values
    entities = {k: v[:15] for k, v in entities.items()}

    # ── Warnings ────────────────────────────────────────────────────
    text_lower = text.lower()
    alerts = []
    seen = set()
    for pattern, message in WARNING_PATTERNS:
        if re.search(pattern, text_lower) and message not in seen:
            alerts.append({"type": "warning", "message": message})
            seen.add(message)

    # ── Clause detection ────────────────────────────────────────────
    clauses = []
    seen_clauses = set()
    for pattern, label in CLAUSE_PATTERNS:
        matches = re.finditer(pattern, text_lower)
        for m in matches:
            if label not in seen_clauses:
                # Find the sentence around the match for context
                start = max(0, m.start() - 80)
                end = min(len(text), m.end() + 120)
                snippet = text[start:end].replace("\n", " ").strip()
                clauses.append({"label": label, "snippet": f"...{snippet}..."})
                seen_clauses.add(label)

    # ── Summary ─────────────────────────────────────────────────────
    sentences = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 30]
    summary_sentences = sentences[:5] if len(sentences) >= 5 else sentences[:3]
    summary = " ".join(summary_sentences) if summary_sentences else "Could not generate a summary from this document."

    return {
        "summary": summary,
        "entities": entities,
        "alerts": alerts,
        "clauses": clauses,
        "wordCount": len(text.split()),
        "charCount": len(text),
    }


# =====================================================================
#  FLASK ROUTES
# =====================================================================
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "EstateIQ NLP Analyzer"})


@app.route("/analyze", methods=["POST"])
def analyze():
    """Accept a file upload (PDF or DOCX), extract text, run NLP, return JSON."""
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    filename = file.filename.lower()

    # Save to a temp file
    suffix = ".pdf" if filename.endswith(".pdf") else ".docx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        # Extract text
        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(tmp_path)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            extracted_text = extract_text_from_docx(tmp_path)
        else:
            return jsonify({"error": "Unsupported file type. Only PDF and DOCX are supported."}), 400

        if not extracted_text or len(extracted_text.strip()) < 20:
            return jsonify({
                "extractedText": extracted_text or "",
                "analysis": {
                    "summary": "The document is empty or contains too little text to analyze.",
                    "entities": {},
                    "alerts": [],
                    "clauses": [],
                    "wordCount": 0,
                    "charCount": 0,
                }
            })

        # Run NLP analysis
        analysis = analyze_text(extracted_text)

        return jsonify({
            "extractedText": extracted_text,
            "analysis": analysis
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5001))
    print(f"🧠 EstateIQ NLP service running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
