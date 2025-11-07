from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import csv, io, os
from utils.mailer import send_bulk_async
import asyncio

app = FastAPI()

RESUME_PATH = "resume/Resume.pdf"  # Your resume path

def parse_emails_from_csv_bytes(csv_bytes: bytes):
    s = csv_bytes.decode("utf-8")
    reader = csv.reader(io.StringIO(s))
    emails = []
    for row in reader:
        if not row: 
            continue
        candidate = row[0].strip()
        if "@" in candidate and "." in candidate:
            emails.append(candidate)
    return emails


@app.post("/send-bulk-email")
async def send_bulk_email(
    subject: str = Form(...),
    body: str = Form(...),
    emails: str | None = Form(None),
    csv_file: UploadFile | None = File(None),
    concurrency: int = Form(10)
):
    recipients = []

    if csv_file:
        content = await csv_file.read()
        parsed = parse_emails_from_csv_bytes(content)
        recipients.extend(parsed)

    if emails:
        for e in emails.replace("\n", ",").split(","):
            if e := e.strip():
                if "@" in e and "." in e:
                    recipients.append(e)

    recipients = list(dict.fromkeys(recipients))

    if not recipients:
        raise HTTPException(status_code=400, detail="No valid recipient emails found.")

    if not os.path.exists(RESUME_PATH):
        raise HTTPException(status_code=500, detail=f"Resume not found at {RESUME_PATH}")

    results = await send_bulk_async(recipients, subject, body, RESUME_PATH, concurrency=concurrency)
    success = sum(1 for r in results if r["status"] == "sent")
    return JSONResponse({"total": len(results), "sent": success, "results": results})
