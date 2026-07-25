"""
Development settings — extends base.py.
"""
from .base import *  # noqa: F401, F403
from decouple import config

DEBUG = True

# Allow all hosts locally
ALLOWED_HOSTS = ["*"]

# Email — print to console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Development Database Configuration (SQLite default for easy local dev/testing)
USE_SQLITE = config("USE_SQLITE", default=True, cast=bool)
if USE_SQLITE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
