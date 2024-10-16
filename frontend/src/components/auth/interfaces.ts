interface ErrorResponse {
  error: string;
}

interface TokenResponse {
  token: string;
}

type AuthenticateResponse = ErrorResponse | TokenResponse;

interface LoginParams {
  email: string;
  password: string;
}
interface RegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cpassword: string;
}

export type { AuthenticateResponse, LoginParams, RegisterParams };
