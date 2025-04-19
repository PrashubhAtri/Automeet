import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
	const [file, setFile] = useState(null);
	const [transcript, setTranscript] = useState("");
	const [loading, setLoading] = useState(false);
	const [darkMode, setDarkMode] = useState(false);
	const [summary, setSummary] = useState([]);
	const [actionItems, setActionItems] = useState([]);


	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
		setTranscript("");
		setSummary([]);
		setActionItems([]);
	};

	const handleUpload = async () => {
		if (!file) return;

		setLoading(true);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("http://localhost:8000/upload/", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			setTranscript(data.transcript);

			// Check if summary info exists (will add later when Gemini is enabled)
			try {
				let cleaned = data.summary;
				// Remove triple backticks and optional "json" label
				if (typeof cleaned === "string") {
					cleaned = cleaned.replace(/```json|```/g, "").trim();
				}
				const parsed = JSON.parse(cleaned);
				setSummary(parsed?.summary || []);
				setActionItems(parsed?.action_items || []);
			} catch (e) {
				console.error("Could not parse summary:", e);
				setSummary([]);
				setActionItems([]);
			}

		} catch (err) {
			setTranscript("Error uploading or processing file.");
		}

		setLoading(false);
	};

	const bgColor = darkMode ? "#111" : "#fafafa";
	const cardColor = darkMode ? "#1e1e1e" : "#fff";
	const textColor = darkMode ? "#f5f5f5" : "#111";
	const secondaryTextColor = darkMode ? "#bbb" : "#666";
	const buttonColor = darkMode ? "#fff" : "#000";
	const buttonTextColor = darkMode ? "#000" : "#fff";
	const borderColor = darkMode ? "#333" : "#eaeaea";

	return (
		<div style={{
			minHeight: "100vh",
			backgroundColor: bgColor,
			color: textColor,
			display: "flex",
			justifyContent: "center",
			alignItems: "flex-start",
			paddingTop: "5vh",
			fontFamily: "Inter, sans-serif",
			transition: "all 0.3s ease"
		}}>
			<div style={{
				width: "100%",
				maxWidth: "700px",
				background: cardColor,
				padding: "2rem",
				borderRadius: "16px",
				boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
				border: `1px solid ${borderColor}`,
				position: "relative"
			}}>
				<button
					onClick={() => setDarkMode(!darkMode)}
					style={{
						position: "absolute",
						top: "1rem",
						right: "1rem",
						background: "none",
						border: "1px solid",
						borderColor: borderColor,
						padding: "0.4rem 0.8rem",
						borderRadius: "6px",
						fontSize: "0.85rem",
						color: textColor,
						cursor: "pointer"
					}}
				>
					{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
				</button>

				<h1 style={{
					fontSize: "1.8rem",
					fontWeight: 600,
					marginBottom: "1.2rem"
				}}>
					AutoMeet
				</h1>

				<p style={{
					color: secondaryTextColor,
					fontSize: "1rem",
					marginBottom: "1.5rem",
				}}>
					Upload your audio file to generate a transcript using AI.
				</p>

				<div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
				<label
					htmlFor="audio-upload"
					style={{
						display: "inline-block",
						padding: "0.6rem 1.2rem",
						backgroundColor: buttonColor,
						color: buttonTextColor,
						borderRadius: "8px",
						fontWeight: 500,
						cursor: "pointer",
						border: "1px solid transparent",
						fontSize: "0.95rem"
					}}
					>
					🎵 Choose File
					<input
						id="audio-upload"
						type="file"
						accept=".mp3,.wav,audio/*"
						onChange={handleFileChange}
						style={{ display: "none" }}
					/>
				</label>
					<button
						onClick={handleUpload}
						disabled={!file || loading}
						style={{
							padding: "0.6rem 1.2rem",
							fontSize: "0.95rem",
							fontWeight: 500,
							backgroundColor: buttonColor,
							color: buttonTextColor,
							border: "none",
							borderRadius: "8px",
							cursor: loading ? "not-allowed" : "pointer",
							opacity: loading ? 0.6 : 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "0.5rem",
							minWidth: "8rem",
							height: "2.5rem"
						}}
						>
					{loading ? (
						<div className={`spinner ${darkMode ? "spinner-dark" : ""}`} />
					) : (
						"Transcribe"
					)}
					</button>

				</div>

				{transcript && (
					<div style={{
						marginTop: "2rem",
						backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
						padding: "1.5rem",
						borderRadius: "12px",
						border: `1px solid ${borderColor}`,
						fontSize: "0.95rem"
					}}>
						<h2 style={{
						fontSize: "1.2rem",
						marginBottom: "1rem",
						fontWeight: 600,
						color: textColor
						}}>
						📄 Transcript
						</h2>
						<button
						onClick={() => {
							const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
							const url = window.URL.createObjectURL(blob);
							const a = document.createElement("a");
							a.href = url;
							a.download = "AutoMeet_Transcript.txt";
							a.click();
							window.URL.revokeObjectURL(url);
						}}
						style={{
							padding: "0.5rem 1rem",
							backgroundColor: darkMode ? "#fff" : "#000",
							color: darkMode ? "#000" : "#fff",
							border: "none",
							borderRadius: "8px",
							fontWeight: 500,
							cursor: "pointer"
						}}
						>
						⬇️ Download Transcript
						</button>
					</div>
					)}


				{summary.length > 0 && (
				<div style={{
					marginTop: "2rem",
					backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
					padding: "1.5rem",
					borderRadius: "12px",
					border: `1px solid ${borderColor}`,
					fontSize: "0.95rem"
				}}>
					<h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", fontWeight: 600 }}>
					📌 Summary
					</h2>
					<ReactMarkdown children={summary.map(item => `- ${item}`).join("\n")} />
				</div>
				)}

				{actionItems.length > 0 && (
				<div style={{
					marginTop: "2rem",
					backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
					padding: "1.5rem",
					borderRadius: "12px",
					border: `1px solid ${borderColor}`,
					fontSize: "0.95rem"
				}}>
					<h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", fontWeight: 600 }}>
					✅ Action Items
					</h2>
					<ul style={{ paddingLeft: "1rem" }}>
					{actionItems.map((item, idx) => (
						<li key={idx} style={{ marginBottom: "0.75rem", lineHeight: 1.5 }}>
						<strong>Task:</strong> {item.task}<br />
						<strong>Owner:</strong> {item.owner}<br />
						<strong>Due:</strong> {item.due_date}
						</li>
					))}
					</ul>
				</div>
				)}


			</div>
		</div>
	);
}

export default App;
