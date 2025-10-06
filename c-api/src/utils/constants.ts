export const forgotPasswordExpirationTimer = 3 * 24 * 60 * 60 * 1000;

export const colaURL = process.env['COLA_URL'] || "http://localhost:3000"

export const HttpStatusCode = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404, 
    NOT_ALLOWED: 405,
    REQUEST_TIMEOUT: 408,
    SERVER_STATE_CONFLICT: 410,
    UNPROCESSABLE: 422, 
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503
} as const;
