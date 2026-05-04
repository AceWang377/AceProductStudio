export type AuthStatusType = "idle" | "success" | "error";

export type AuthStatusMessage = {
  type: AuthStatusType;
  text: string;
};

const authMessages: Record<string, AuthStatusMessage> = {
  callback_failed: {
    type: "error",
    text: "We could not finish signing you in. Request a fresh link and try again."
  },
  expired_link: {
    type: "error",
    text: "That sign-in link has expired or was already used. Request a new link to continue."
  },
  missing_code: {
    type: "error",
    text: "The sign-in link is incomplete. Request a new link from this page."
  }
};

export function getAuthStatusMessage(value?: string): AuthStatusMessage {
  if (!value) return { type: "idle", text: "" };

  const knownMessage = authMessages[value];
  if (knownMessage) return knownMessage;

  return {
    type: "error",
    text: "Something interrupted sign-in. Request a new link and try again."
  };
}

