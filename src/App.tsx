import React, { useState } from "react";
import axios from "axios";

const apiKey = import.meta.env.API_KEY; // ✅ Vite
console.log("API Key:", apiKey);

import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Paper,
} from "@mui/material";

type GPTAction = "rewrite" | "summarize" | "translate";
type Tone = "default" | "formal" | "casual" | "professional";

const TONE_LABELS: Record<Tone, string> = {
  default: "Default",
  formal: "Formal",
  casual: "Casual",
  professional: "Professional",
};

const TRANSLATE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
];

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = (import.meta as any).env.API_KEY;

function getPrompt(
  action: GPTAction,
  text: string,
  tone: Tone,
  translateLang: string
) {
  switch (action) {
    case "rewrite":
      return `Rewrite the following text${
        tone !== "default" ? ` in a ${tone} tone` : ""
      }:\n\n${text}`;
    case "summarize":
      return `Summarize the following text in 3-5 concise sentences:\n\n${text}`;
    case "translate":
      return `Translate the following text into ${
        TRANSLATE_LANGUAGES.find((l) => l.value === translateLang)?.label ||
        translateLang
      }:\n\n${text}`;
    default:
      return text;
  }
}

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>("default");
  const [translateLang, setTranslateLang] = useState("hi");

  const handleGPTAction = async (action: GPTAction) => {
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const prompt = getPrompt(action, input, tone, translateLang);
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI writing assistant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 512,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      setOutput(response.data.choices[0].message.content.trim());
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        ChatGPT Writing Assistant
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <TextField
          label="Enter your text here..."
          placeholder="Type or paste your content"
          multiline
          minRows={8}
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          variant="outlined"
        />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            mt: 2,
          }}
        >
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="tone-label">Tone</InputLabel>
            <Select
              labelId="tone-label"
              value={tone}
              label="Tone"
              onChange={(e) => setTone(e.target.value as Tone)}
              size="small"
            >
              {Object.entries(TONE_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => handleGPTAction("rewrite")}
            disabled={!input || loading}
          >
            Rewrite
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleGPTAction("summarize")}
            disabled={!input || loading}
          >
            Summarize
          </Button>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="translate-lang-label">Language</InputLabel>
            <Select
              labelId="translate-lang-label"
              value={translateLang}
              label="Language"
              onChange={(e) => setTranslateLang(e.target.value)}
              size="small"
            >
              {TRANSLATE_LANGUAGES.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleGPTAction("translate")}
            disabled={!input || loading}
          >
            Translate
          </Button>
          {loading && <CircularProgress size={28} />}
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>
      {output && (
        <Paper elevation={2} sx={{ p: 3, backgroundColor: "#f3f6fa" }}>
          <Typography variant="h6" gutterBottom>
            Output
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {output}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default App;