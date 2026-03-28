export async function getAppErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.'
): Promise<string> {
  const maybeError = error as {
    message?: string;
    context?: {
      json?: () => Promise<unknown>;
      text?: () => Promise<string>;
      status?: number;
      statusText?: string;
    };
  };

  if (maybeError?.context?.json) {
    try {
      const body = await maybeError.context.json();
      if (
        body &&
        typeof body === 'object' &&
        'error' in body &&
        typeof (body as { error?: unknown }).error === 'string'
      ) {
        return (body as { error: string }).error;
      }
    } catch {
      // ignore json parse failure
    }
  }

  if (maybeError?.context?.text) {
    try {
      const text = await maybeError.context.text();
      if (text?.trim()) return text;
    } catch {
      // ignore text parse failure
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}