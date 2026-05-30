from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


# Request body schema for creating a health log.
# These values are submitted by the authenticated user.
class HealthLogCreate(BaseModel):
    blood_sugar: float = Field(
        ...,
        ge=50,
        le=500,
        description="Blood sugar reading in realistic range (50-500)",
    )
    weight: float = Field(
        ...,
        ge=20,
        le=300,
        description="Current body weight in realistic range (20-300)",
    )
    exercise_minutes: int = Field(
        ...,
        ge=0,
        description="Exercise duration in minutes (cannot be negative)",
    )


# Response schema representing a saved health log row.
class HealthLogResponse(BaseModel):
    id: int = Field(..., description="Database id of the health log")
    user_id: int = Field(..., description="Owner user id")
    blood_sugar: float = Field(..., description="Stored blood sugar reading")
    weight: float = Field(..., description="Stored body weight")
    exercise_minutes: int = Field(..., description="Stored exercise duration")
    created_at: datetime = Field(..., description="Creation timestamp")


# One weekly point designed for chart plotting in Flutter.
# Example usage: x-axis = week_start, y-axis = avg_blood_sugar / avg_weight.
class WeeklyHealthPoint(BaseModel):
    week_start: str = Field(..., description="ISO date string for week start (YYYY-MM-DD)")
    avg_blood_sugar: float = Field(..., description="Average blood sugar for the week")
    avg_weight: float = Field(..., description="Average weight for the week")
    total_exercise_minutes: int = Field(..., description="Total exercise minutes for the week")


# Analytics response schema for dashboard/chart screens.
class HealthAnalyticsResponse(BaseModel):
    weekly_data: List[WeeklyHealthPoint] = Field(..., description="List of weekly chart points")
    last_n_weeks: int = Field(..., description="Number of weeks included in the response")
    overall_total_exercise_minutes: int = Field(
        ..., description="Total exercise minutes across returned weeks"
    )


# One monthly point for long-term trend visualizations.
class MonthlyHealthPoint(BaseModel):
    month: str = Field(..., description="Month label in YYYY-MM format")
    avg_blood_sugar: float = Field(..., description="Average blood sugar for the month")
    avg_weight: float = Field(..., description="Average weight for the month")
    total_exercise_minutes: int = Field(..., description="Total exercise minutes for the month")


# Response schema for monthly analytics cards and trend charts.
class MonthlyHealthAnalyticsResponse(BaseModel):
    monthly_data: List[MonthlyHealthPoint] = Field(..., description="List of monthly trend points")
    overall_avg_blood_sugar: float = Field(
        ..., description="Weighted average blood sugar across returned months"
    )
    overall_avg_weight: float = Field(
        ..., description="Weighted average weight across returned months"
    )
    overall_total_exercise_minutes: int = Field(
        ..., description="Total exercise minutes across returned months"
    )
