import React, { useState } from "react";
import axios from "axios";

function App() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emails, setEmails] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) {
      alert("Please enter subject and body!");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("body", body);
    if (emails) formData.append("emails", emails);
    if (file) formData.append("csv_file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/send-bulk-email", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res.data);
      setResults(res.data.results);
    } catch (err: any) {
      alert("Error sending emails: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  from-blue-800 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">📧 Job Mail Sender</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Subject</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Application for Frontend Developer"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Body</label>
            <textarea
              rows={5}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi, I’m Dipal — attaching my resume for your review."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Recipients</label>
            <textarea
              rows={2}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="hr@abc.com, hr@xyz.in"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Or Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-300"
          >
            {loading ? "Sending..." : "Send Emails"}
          </button>
        </form>

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Results</h2>
            <div className="bg-gray-50 border rounded-lg p-3 max-h-60 overflow-y-auto text-sm">
              {results.map((r, i) => (
                <p key={i} className={r.status === "sent" ? "text-green-600" : "text-red-600"}>
                  {r.email} → {r.status}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="mt-6 text-gray-500 text-sm">Made with ❤️ using FastAPI + React + Tailwind</p>
    </div>
  );
}

export default App;
