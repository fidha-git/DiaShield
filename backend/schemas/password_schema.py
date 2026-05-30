from pydantic import BaseModel, EmailStr


# Forgot password request
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# Forgot password response
class ForgotPasswordResponse(BaseModel):
    message: str


# Reset password request
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# Reset password response
class ResetPasswordResponse(BaseModel):
    message: str


# Change password request
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# Change password response
class ChangePasswordResponse(BaseModel):
    message: str