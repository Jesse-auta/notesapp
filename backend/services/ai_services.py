from google import genai
import json
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_and_tag(title: str, content: str) -> dict:
    prompt = f"""You are a helpful assistant for a notes app.

    Given the following note, return a JSON object with exactly two keys:
    - "summary": a concise 1-2 sentence summary of the note
    - "tags": a list of 3-5 relevant single-word or short tags

    Note Title: {title}
    Note Content: {content}

    Respond ONLY with valid JSON."""

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=genai.GenerateContentConfig(
                response_mime_type="application/json",
                safety_settings=[
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                    },
                ]
            )
        )

        result = json.loads(response.text)

        return {
            "summary": result.get("summary", ""),
            "tags": ", ".join(result.get("tags", []))
        }
    except Exception as e:
        # Handle errors gracefully
        return {
            "summary": "Error generating summary.",
            "tags": ""
        }