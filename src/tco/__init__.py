"""TCO calculation package for the cloud repatriation dashboard."""

from .calculator import calculate_tco
from .models import CloudCostAssumptions, LocalCostAssumptions, ProjectionRow, TCOResult
from .recommender import PlacementRecommendation, recommend_placement

__all__ = [
    "CloudCostAssumptions",
    "LocalCostAssumptions",
    "PlacementRecommendation",
    "ProjectionRow",
    "TCOResult",
    "calculate_tco",
    "recommend_placement",
]
