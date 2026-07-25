"""
Pagination classes.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsPagination(PageNumberPagination):
    """
    Default pagination used across all endpoints.

    Response shape::

        {
            "count": 100,
            "next": "http://...",
            "previous": null,
            "page": 1,
            "page_size": 20,
            "total_pages": 5,
            "results": [...]
        }
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
    page_query_param = "page"

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "page": self.page.number,
                "page_size": self.get_page_size(self.request),
                "total_pages": self.page.paginator.num_pages,
                "results": data,
            }
        )

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "properties": {
                "count": {"type": "integer", "example": 100},
                "next": {"type": "string", "nullable": True},
                "previous": {"type": "string", "nullable": True},
                "page": {"type": "integer", "example": 1},
                "page_size": {"type": "integer", "example": 20},
                "total_pages": {"type": "integer", "example": 5},
                "results": schema,
            },
        }


class LargeResultsPagination(PageNumberPagination):
    """Used for endpoints that need larger default page sizes (e.g., exports)."""

    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 500
