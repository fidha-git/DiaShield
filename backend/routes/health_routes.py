from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.db import get_db
from models.health_model import HealthLog
from models.user_model import User
from schemas.health_schema import (
    HealthAnalyticsResponse,
    HealthLogCreate,
    HealthLogResponse,
    MonthlyHealthAnalyticsResponse,
    MonthlyHealthPoint,
    WeeklyHealthPoint,
)
from utils.auth_middleware import get_current_user

# Router for health tracking endpoints
router = APIRouter(tags=["health"])


@router.post("/health", response_model=HealthLogResponse)
def create_health_log(
    payload: HealthLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new health log for the authenticated user.

    Beginner note:
    - We read user metrics from `payload`.
    - We attach the current logged-in user's id.
    - We save the row to PostgreSQL, then return the saved row.
    """

    # Build a SQLAlchemy object from the request body
    health_log = HealthLog(
        user_id=current_user.id,
        blood_sugar=payload.blood_sugar,
        weight=payload.weight,
        exercise_minutes=payload.exercise_minutes,
    )

    # Save to PostgreSQL
    db.add(health_log)
    db.commit()
    db.refresh(health_log)

    return HealthLogResponse(
        id=health_log.id,
        user_id=health_log.user_id,
        blood_sugar=health_log.blood_sugar,
        weight=health_log.weight,
        exercise_minutes=health_log.exercise_minutes,
        created_at=health_log.created_at,
    )


@router.get("/health-history", response_model=List[HealthLogResponse])
def get_health_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's health logs (newest first)."""

    # Query only records that belong to the logged-in user
    records = (
        db.query(HealthLog)
        .filter(HealthLog.user_id == current_user.id)
        .order_by(HealthLog.created_at.desc())
        .all()
    )

    return [
        HealthLogResponse(
            id=record.id,
            user_id=record.user_id,
            blood_sugar=record.blood_sugar,
            weight=record.weight,
            exercise_minutes=record.exercise_minutes,
            created_at=record.created_at,
        )
        for record in records
    ]


@router.get("/health-analytics", response_model=HealthAnalyticsResponse)
def get_health_analytics(
    last_n_weeks: int = Query(
        8,
        ge=1,
        le=104,
        description="Number of recent weeks to include (default: 8)",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return weekly health analytics for the authenticated user.

    Beginner note:
    - We fetch all logs for the logged-in user.
    - We group logs by calendar week (Monday start).
    - We calculate weekly averages and totals for chart widgets.
    """

    # Pull all records once, ordered oldest to newest for stable grouping.
    records = (
        db.query(HealthLog)
        .filter(HealthLog.user_id == current_user.id)
        .order_by(HealthLog.created_at.asc())
        .all()
    )

    # Group metrics by the Monday of each week.
    weekly_buckets = {}
    for record in records:
        # Convert timestamp to the week start date (Monday).
        week_start_date = (record.created_at - timedelta(days=record.created_at.weekday())).date()
        week_key = week_start_date.isoformat()

        if week_key not in weekly_buckets:
            weekly_buckets[week_key] = {
                "blood_sugar_sum": 0.0,
                "weight_sum": 0.0,
                "count": 0,
                "exercise_total": 0,
            }

        weekly_buckets[week_key]["blood_sugar_sum"] += float(record.blood_sugar)
        weekly_buckets[week_key]["weight_sum"] += float(record.weight)
        weekly_buckets[week_key]["exercise_total"] += int(record.exercise_minutes)
        weekly_buckets[week_key]["count"] += 1

    # Convert grouped values into response items suited for Flutter chart series.
    # We keep only the most recent N weeks based on `last_n_weeks`.
    weekly_data = []
    overall_total_exercise_minutes = 0
    week_keys = sorted(weekly_buckets.keys())[-last_n_weeks:]
    for week_key in week_keys:
        bucket = weekly_buckets[week_key]
        count = bucket["count"]

        avg_blood_sugar = round(bucket["blood_sugar_sum"] / count, 2) if count else 0.0
        avg_weight = round(bucket["weight_sum"] / count, 2) if count else 0.0
        total_exercise = bucket["exercise_total"]

        overall_total_exercise_minutes += total_exercise

        weekly_data.append(
            WeeklyHealthPoint(
                week_start=week_key,
                avg_blood_sugar=avg_blood_sugar,
                avg_weight=avg_weight,
                total_exercise_minutes=total_exercise,
            )
        )

    return HealthAnalyticsResponse(
        weekly_data=weekly_data,
        last_n_weeks=last_n_weeks,
        overall_total_exercise_minutes=overall_total_exercise_minutes,
    )


@router.get("/monthly-health-analytics", response_model=MonthlyHealthAnalyticsResponse)
def get_monthly_health_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return monthly health analytics for long-term dashboard trends.

    Beginner note:
    - We group all user logs by month (YYYY-MM).
    - We calculate monthly averages for blood sugar and weight.
    - We calculate monthly total exercise minutes for trend cards/charts.
    """

    # Fetch all records for the current user.
    records = (
        db.query(HealthLog)
        .filter(HealthLog.user_id == current_user.id)
        .order_by(HealthLog.created_at.asc())
        .all()
    )

    # Group rows by month label, for example "2026-05".
    monthly_buckets = {}
    for record in records:
        month_key = record.created_at.strftime("%Y-%m")

        if month_key not in monthly_buckets:
            monthly_buckets[month_key] = {
                "blood_sugar_sum": 0.0,
                "weight_sum": 0.0,
                "count": 0,
                "exercise_total": 0,
            }

        monthly_buckets[month_key]["blood_sugar_sum"] += float(record.blood_sugar)
        monthly_buckets[month_key]["weight_sum"] += float(record.weight)
        monthly_buckets[month_key]["exercise_total"] += int(record.exercise_minutes)
        monthly_buckets[month_key]["count"] += 1

    # Build chart-friendly list and compute dashboard summary metrics.
    monthly_data = []
    overall_blood_sugar_sum = 0.0
    overall_weight_sum = 0.0
    overall_count = 0
    overall_total_exercise_minutes = 0

    for month_key in sorted(monthly_buckets.keys()):
        bucket = monthly_buckets[month_key]
        count = bucket["count"]

        avg_blood_sugar = round(bucket["blood_sugar_sum"] / count, 2) if count else 0.0
        avg_weight = round(bucket["weight_sum"] / count, 2) if count else 0.0
        total_exercise = bucket["exercise_total"]

        monthly_data.append(
            MonthlyHealthPoint(
                month=month_key,
                avg_blood_sugar=avg_blood_sugar,
                avg_weight=avg_weight,
                total_exercise_minutes=total_exercise,
            )
        )

        overall_blood_sugar_sum += bucket["blood_sugar_sum"]
        overall_weight_sum += bucket["weight_sum"]
        overall_count += count
        overall_total_exercise_minutes += total_exercise

    overall_avg_blood_sugar = round(overall_blood_sugar_sum / overall_count, 2) if overall_count else 0.0
    overall_avg_weight = round(overall_weight_sum / overall_count, 2) if overall_count else 0.0

    return MonthlyHealthAnalyticsResponse(
        monthly_data=monthly_data,
        overall_avg_blood_sugar=overall_avg_blood_sugar,
        overall_avg_weight=overall_avg_weight,
        overall_total_exercise_minutes=overall_total_exercise_minutes,
    )
