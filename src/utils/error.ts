import i18n from "../i18n";

export function getCorsMessage() {
  return i18n.t("errors.corsMessage");
}

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

export function getReadableError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return i18n.t("errors.stopped");
  }

  if (error instanceof TypeError) {
    return i18n.t("errors.typeErrorPrefix", {
      message: getCorsMessage(),
      error: error.message,
    });
  }

  if (error instanceof Error) {
    return error.message || i18n.t("errors.requestFailed");
  }

  return i18n.t("errors.requestFailed");
}

export function getHttpErrorMessage(status: number, bodyText?: string) {
  const suffix = bodyText
    ? i18n.t("errors.serviceReturned", { body: bodyText.slice(0, 600) })
    : "";

  if (status === 401) {
    return i18n.t("errors.http401", { suffix });
  }
  if (status === 403) {
    return i18n.t("errors.http403", { suffix });
  }
  if (status === 429) {
    return i18n.t("errors.http429", { suffix });
  }
  if (status >= 500) {
    return i18n.t("errors.http5xx", { status, suffix });
  }
  return i18n.t("errors.httpGeneric", { status, suffix });
}
