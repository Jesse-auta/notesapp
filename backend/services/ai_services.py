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

        response_data = response.json()
        print("OpenRouter response:", response_data)

        if 'error' in response_data:
            print(f"API error: {response_data['error']}")
            return {"summary": "Error generating summary.", "tags": ""}

        if 'choices' not in response_data:
            print("No choices in response")
            return {"summary": "Error generating summary.", "tags": ""}

        raw = response_data["choices"][0]["message"]["content"].strip()

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


def chat_response(question: str, context: str) -> str:
    prompt = f"""You are a helpful AI assistant for a notes app.
    The user has the following notes:

    {context}

    Answer this question based on their notes: {question}

    Be concise, helpful, and refer specifically to what's in their notes."""

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

        response_data = response.json()
        print("OpenRouter response:", response_data)

        if 'error' in response_data:
            print(f"API error: {response_data['error']}")
            return "I couldn't find an answer in your notes right now. Please try again."

        if 'choices' not in response_data:
            print("No choices in response")
            return "I couldn't find an answer in your notes right now. Please try again."

        raw = response_data["choices"][0]["message"]["content"].strip()
        return raw
    except Exception as e:
        print(f"Chat error: {e}")
        return "I couldn't find an answer in your notes right now. Please try again."


def semantic_search(query: str, notes: list) -> list:
    if not notes:
        return []

    notes_context = "\n\n".join([
        f"ID: {n['id']}\nTitle: {n['title']}\nContent: {n['content'] or ''}\nSummary: {n['summary'] or ''}\nTags: {n['tags'] or ''}"
        for n in notes
    ])

    prompt = f"""You are a semantic search engine for a notes app.

    The user is searching for: "{query}"

    Here are the user's notes:
    {notes_context}

    Return a JSON array of the most relevant notes (maximum 5). For each match include:
    - "id": the note's ID (integer)
    - "reason": a short phrase explaining why it matched (e.g. "relates to work tasks")

    Only include notes that are genuinely relevant. If nothing matches, return an empty array [].
    Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks."""

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

        response_data = response.json()
        print("OpenRouter response:", response_data)

        if 'error' in response_data:
            print(f"API error: {response_data['error']}")
            return []

        if 'choices' not in response_data:
            print("No choices in response")
            return []

        raw = response_data["choices"][0]["message"]["content"].strip()
        print(raw)

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        results = json.loads(raw)
        return results if isinstance(results, list) else []

    except Exception as e:
        print(f"Semantic search error: {e}")
        return []