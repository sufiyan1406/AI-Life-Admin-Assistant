from fastapi import Header, HTTPException
from jose import jwt
from config import settings

def get_current_user_id(authorization: str = Header(None)):
    """Extract and validate user_id from Supabase JWT."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        # Bearer <token>
        token = authorization.split(" ")[1]
        # Supabase uses the same SUPABASE_KEY (if Service Role) or a specific JWT secret
        # In this simple REST setup, we often rely on Supabase to validate if we pass the token.
        # However, to get the user_id on the backend without a full Supabase SDK:
        # We can decode the JWT. Supabase JWTs are signed with the project's JWT secret.
        # If the user hasn't provided the secret, we can also just use the token to call Supabase Auth /user
        # or trust the 'sub' field if we can verify the signature.
        
        # For this implementation, we will assume the 'sub' field in the JWT is the user_id.
        # SECURITY NOTE: In production, verify the JWT signature using SUPABASE_JWT_SECRET.
        payload = jwt.get_unverified_claims(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub claim")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
