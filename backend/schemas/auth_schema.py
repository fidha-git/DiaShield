from pydantic import BaseModel, EmailStr, Field


# -----------------------------
# Registration Schema
# -----------------------------
class UserRegister(BaseModel):
    username: str = Field(
        ...,
        description="User username"
    )

    email: EmailStr = Field(
        ...,
        description="User email address"
    )

    password: str = Field(
        ...,
        description="User password"
    )

    role: str = Field(
        default="patient",
        description="User role: patient | doctor | admin"
    )


# -----------------------------
# Login Request Schema
# -----------------------------
class LoginRequest(BaseModel):
    email: str = Field(
        ...,
        description="User email or username"
    )

    password: str = Field(
        ...,
        description="User password"
    )


# -----------------------------
# Login Response Schema
# -----------------------------
class LoginResponse(BaseModel):
    success: bool = Field(
        ...,
        description="Whether login was successful"
    )

    message: str = Field(
        ...,
        description="Login result message"
    )

    access_token: str = Field(
        ...,
        description="JWT access token"
    )

    token_type: str = Field(
        ...,
        description="Token type (bearer)"
    )

    username: str = Field(
        ...,
        description="Logged-in username"
    )

    role: str = Field(
        ...,
        description="Logged-in user role"
    )