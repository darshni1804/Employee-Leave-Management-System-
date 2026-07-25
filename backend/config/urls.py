"""
Root URL configuration.
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.http import HttpResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# ─────────────────────────────────────────
# API routes
# ─────────────────────────────────────────
api_auth_patterns = [
    path("", include("apps.accounts.urls")),
]

api_v1_patterns = [
    path("auth/", include("apps.accounts.urls", namespace="accounts")),
    path("leaves/", include("apps.leaves.urls", namespace="leaves")),
    path("dashboard/", include("apps.dashboard.urls", namespace="dashboard")),
]

urlpatterns = [
    # Root redirect to Swagger UI docs
    path("", RedirectView.as_view(url="/api/schema/swagger-ui/", permanent=False), name="root-redirect"),

    # Favicon 204 No Content handler
    path("favicon.ico", lambda request: HttpResponse(status=204), name="favicon"),

    # Django Admin
    path("admin/", admin.site.urls),

    # Support /api/auth/ directly
    path("api/auth/", include(api_auth_patterns)),

    # API v1
    path("api/v1/", include((api_v1_patterns, "api_v1"))),

    # OpenAPI schema
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
