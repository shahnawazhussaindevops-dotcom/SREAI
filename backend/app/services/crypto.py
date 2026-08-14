"""
Credential encryption for sensitive server connection details.

Uses Fernet (AES-128-CBC with HMAC-SHA256) symmetric encryption. The key is
loaded from ENCRYPTION_KEY env var, or auto-generated and persisted to a
`.secret_key` file next to the backend package so it survives restarts.
"""
import os
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings

_KEY_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    ".secret_key",
)


def _load_or_create_key() -> bytes:
    if settings.ENCRYPTION_KEY:
        key = settings.ENCRYPTION_KEY.encode("utf-8")
    elif os.path.exists(_KEY_FILE):
        with open(_KEY_FILE, "rb") as f:
            key = f.read().strip()
    else:
        key = Fernet.generate_key()
        try:
            with open(_KEY_FILE, "wb") as f:
                f.write(key)
        except OSError:
            # Best-effort persistence; if we cannot write, key still works for the session.
            pass

    if not key or len(key) != 44:
        raise RuntimeError(
            "ENCRYPTION_KEY must be a valid 44-character URL-safe Fernet key "
            "(generate one with `python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"`)."
        )
    return key


_fernet = Fernet(_load_or_create_key())


def encrypt_secret(plaintext: Optional[str]) -> Optional[str]:
    """Encrypt a secret string (password / private key). Returns None for empty input."""
    if not plaintext:
        return None
    return _fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_secret(token: Optional[str]) -> Optional[str]:
    """Decrypt a previously encrypted secret. Returns None for empty / invalid tokens."""
    if not token:
        return None
    try:
        return _fernet.decrypt(token.encode("utf-8")).decode("utf-8")
    except (InvalidToken, ValueError):
        return None
