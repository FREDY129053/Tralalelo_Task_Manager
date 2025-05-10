from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Dict, Union

TOKEN_EXPIRE_MINUTES = 30 
ALGORITHM = "HS256"
JWT_SECRET_KEY = "выеб города заработал денег"

def create_jwt_token(data: Dict[str, str], expires_delta: int = None) -> str:
  if expires_delta is not None:
    expires_delta = datetime.now() + expires_delta
  else:
    expires_delta = datetime.now() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)

  data_copy = data.copy()
  data_copy["exp"] = expires_delta

  to_encode = data_copy
  encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)

  return encoded_jwt

def decode_jwt_token(token: str) -> Union[Dict, None]:
  try:
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    return payload
  except JWTError:
    return None