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
