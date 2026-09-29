import { ApiError } from './http';

function readMessageFromDetails(details: unknown): string | null {
  if (!details || typeof details !== 'object') {
    return null;
  }

  const record = details as Record<string, unknown>;

  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }

  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error;
  }

  if (typeof record.errors === 'string' && record.errors.trim()) {
    return record.errors;
  }

  return null;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return readMessageFromDetails(error.details) ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
