from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def healthcheck(request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "backend",
            "project": "tcc-startup-platform",
        }
    )
