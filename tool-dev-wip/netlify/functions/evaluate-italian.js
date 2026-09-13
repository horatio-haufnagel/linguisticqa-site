const SYSTEM_PROMPT = `Sei un esperto di linguistica italiana specializzato nella valutazione di output
di modelli AI. Analizza il testo fornito e identifica problemi linguistici.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido, senza markdown, senza backtick,
senza testo prima o dopo. Formato esatto:

{
  "score": <numero intero 0-100, qualità complessiva>,
  "summary": "<frase breve in italiano che riassume il giudizio complessivo>",
  "errors": [
    {
      "categoria": "<una di: concordanza | registro | calco | sintassi | terminologia | fluency>",
      "severita": "<una di: critico | medio | minore>",
      "frammento": "<testo originale problematico, max 60 caratteri>",
      "spiegazione": "<perché è un problema, max 120 caratteri>",
      "suggerimento": "<riscrittura corretta o migliorata>"
    }
  ]
}

Se il testo non ha errori rilevanti, restituisci errors come array vuoto e score alto (85-100).
Analizza per: concordanza genere/numero, registro incoerente (tu/lei/voi misto),
calchi dall'inglese o costruzioni non idiomatiche, problemi sintattici,
terminologia inconsistente, fluency e naturalezza generale.`;

async function callGemini(text, key, extraInstruction = "") {
  const systemContent = SYSTEM_PROMPT + (extraInstruction ? "\n" + extraInstruction : "");
  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: text },
        ],
        max_tokens: 1000,
      }),
    }
  );
  const data = await resp.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function callGeminiWithRetry(text, key) {
  try {
    return await callGemini(text, key);
  } catch {
    return await callGemini(text, key, "Rispondi solo con JSON puro, nessun testo aggiuntivo.");
  }
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body non valido." }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return Response.json({ error: "Testo mancante." }, { status: 400 });
  }
  if (text.length > 2000) {
    return Response.json({ error: "Testo troppo lungo (max 2000 caratteri)." }, { status: 400 });
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return Response.json({ error: "Servizio non disponibile." }, { status: 500 });
  }

  try {
    const result = await callGeminiWithRetry(text, GEMINI_KEY);
    return Response.json(result);
  } catch {
    return Response.json({ error: "Errore durante l'analisi. Riprova." }, { status: 500 });
  }
};
