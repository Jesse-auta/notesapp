import requests
import json
import os

def summarize_and_tag(title: str, content: str) -> dict:
    prompt = f"""You are a helpful assistant for a notes app.
Given the following note, return a JSON object with exactly two keys:
- "summary": a concise 1-2 sentence summary of the note
- "tags": a list of 3-5 relevant single-word or short tags

Note Title: {title}
Note Content: {content}

Respond ONLY with valid JSON. No explanation, no markdown, no backticks."""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openrouter/free",
                "messages": [{"role": "user", "content": prompt}]
            }
        )

        print("OpenRouter response:", response.json())

        raw = response.json()["choices"][0]["message"]["content"].strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        result = json.loads(raw)

        return {
            "summary": result.get("summary", ""),
            "tags": ", ".join(result.get("tags", []))
        }

    except Exception as e:
        print(f"AI error: {e}")
        return {"summary": "Error generating summary.", "tags": ""}