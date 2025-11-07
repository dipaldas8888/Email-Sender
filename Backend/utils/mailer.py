import os
from email.message import EmailMessage
from dotenv import load_dotenv
import asyncio
import aiosmtplib

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
FROM_NAME = os.getenv("FROM_NAME") or EMAIL_USER

async def _send_single(recipient: str, subject: str, body: str, resume_path: str, smtp_host="smtp.gmail.com", smtp_port=465):
    msg = EmailMessage()
    msg["From"] = f"{FROM_NAME} <{EMAIL_USER}>"
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.set_content(body)

    # Attach resume
    if resume_path:
        with open(resume_path, "rb") as f:
            file_data = f.read()
            file_name = os.path.basename(resume_path)
        msg.add_attachment(file_data, maintype="application", subtype="pdf", filename=file_name)

    await aiosmtplib.send(
        msg,
        hostname=smtp_host,
        port=smtp_port,
        username=EMAIL_USER,
        password=EMAIL_PASS,
        use_tls=True,
    )

async def send_bulk_async(recipients: list[str], subject: str, body: str, resume_path: str, concurrency: int = 10):
    results = []
    sem = asyncio.Semaphore(concurrency)

    async def worker(recipient):
        async with sem:
            try:
                await _send_single(recipient, subject, body, resume_path)
                results.append({"email": recipient, "status": "sent"})
            except Exception as e:
                results.append({"email": recipient, "status": f"error: {str(e)}"})

    tasks = [asyncio.create_task(worker(r)) for r in recipients]
    await asyncio.gather(*tasks)
    return results
