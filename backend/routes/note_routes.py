from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.note import Note
from services.ai_services import summarize_and_tag, chat_response, semantic_search

note_bp = Blueprint("notes", __name__)

@note_bp.route("/", methods=["POST"])
@jwt_required()
def create_note():

    user_id = int(get_jwt_identity())

    data = request.json

    title = data.get("title")
    content = data.get("content")

    note = Note(
        user_id=user_id,
        title=title,
        content=content
    )

    db.session.add(note)
    db.session.commit()

    return jsonify({
        "message": "Note created",
        "note_id": note.id
    }), 201


@note_bp.route("/", methods=["GET"])
@jwt_required()
def get_notes():

    user_id = int(get_jwt_identity())

    notes = Note.query.filter_by(user_id=user_id).all()

    result = []

    for note in notes:
        result.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "summary": note.summary,
            "tags": note.tags,
            "created_at": note.created_at
        })

    return jsonify(result)


@note_bp.route("/search", methods=["GET"])
@jwt_required()
def search_notes():
    user_id = int(get_jwt_identity())
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({"results": []}), 200

    # Fetch all user's notes
    notes = Note.query.filter_by(user_id=user_id).all()

    if not notes:
        return jsonify({"results": []}), 200

    # Build notes list for AI
    notes_data = [
        {
            "id": note.id,
            "title": note.title or "",
            "content": note.content or "",
            "summary": note.summary or "",
            "tags": note.tags or ""
        }
        for note in notes
    ]

    matches = semantic_search(query, notes_data)

    # Attach full note data to each match
    notes_map = {note.id: note for note in notes}
    results = []

    for match in matches:
        note = notes_map.get(match.get("id"))
        if note:
            results.append({
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "summary": note.summary,
                "tags": note.tags,
                "created_at": str(note.created_at),
                "reason": match.get("reason", "")
            })

    return jsonify({"results": results}), 200


@note_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_note(id):

    user_id = int(get_jwt_identity())

    note = Note.query.filter_by(id=id, user_id=user_id).first()

    if not note:
        return jsonify({"error": "Note not found"}), 404

    return jsonify({
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "summary": note.summary,
        "tags": note.tags
    })


@note_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_note(id):

    user_id = int(get_jwt_identity())

    note = Note.query.filter_by(id=id, user_id=user_id).first()

    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.json

    note.title = data.get("title", note.title)
    note.content = data.get("content", note.content)

    db.session.commit()

    return jsonify({"message": "Note updated"})


@note_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_note(id):

    user_id = int(get_jwt_identity())

    note = Note.query.filter_by(id=id, user_id=user_id).first()

    if not note:
        return jsonify({"error": "Note not found"}), 404

    db.session.delete(note)
    db.session.commit()

    return jsonify({"message": "Note deleted"})


@note_bp.route("/<int:id>/summarize", methods=["POST"])
@jwt_required()
def summarize_note(id):

    user_id = int(get_jwt_identity())

    note = Note.query.filter_by(id=id, user_id=user_id).first()

    if not note:
        return jsonify({"error": "Note not found"}), 404

    if not note.content:
        return jsonify({"error": "Note has no content to summarize"}), 400

    result = summarize_and_tag(note.title or "", note.content)

    note.summary = result["summary"]
    note.tags = result["tags"]
    db.session.commit()

    return jsonify({
        "message": "Note summarized",
        "summary": note.summary,
        "tags": note.tags
    })


@note_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat_with_notes():
    data = request.json
    question = data.get("question", "")
    context = data.get("context", "")

    if not question:
        return jsonify({"error": "Question is required"}), 400


    answer = chat_response(question, context)
    return jsonify({"answer": answer})


