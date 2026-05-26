import { BadRequestError } from "../errors/bad-request.error.js";
import { ForbiddenError } from "../errors/forbidden.error.js";

type AllowedRole = "BUYER" | "KURIR" | "BOTH";

type TransitionConfig = {
  nextState: string;
  allowedRole: AllowedRole;
};

const orderTransitions: Record<string, Record<string, TransitionConfig>> = {
  PENDING: {
    accept: { nextState: "ACCEPTED", allowedRole: "KURIR" },
    cancel: { nextState: "CANCELLED", allowedRole: "BUYER" },
  },
  ACCEPTED: {
    price: { nextState: "PRICED", allowedRole: "KURIR" },
    cancel: { nextState: "CANCELLED", allowedRole: "BOTH" },
  },
  PRICED: {
    pay: { nextState: "PAID", allowedRole: "BUYER" },
    cancel: { nextState: "CANCELLED", allowedRole: "BOTH" },
  },
  PAID: {
    complete: { nextState: "COMPLETED", allowedRole: "KURIR" },
  },
} as const;

export function validateTransition(
  currentStatus: string,
  action: string,
  userId: string,
  buyerId: string,
  kurirId: string | null,
): string {
  const stateActions = orderTransitions[currentStatus];
  if (!stateActions) {
    throw new BadRequestError(`No actions available for status '${currentStatus}'`);
  }

  const transition = stateActions[action];
  if (!transition) {
    throw new BadRequestError(`Action '${action}' is not allowed when order is '${currentStatus}'`);
  }

  const isBuyer = userId === buyerId;
  const isKurir = kurirId !== null && userId === kurirId;

  switch (transition.allowedRole) {
    case "BUYER":
      if (!isBuyer) throw new ForbiddenError("Only the buyer can perform this action");
      break;
    case "KURIR":
      if (!isKurir && action !== "accept") throw new ForbiddenError("Only the assigned kurir can perform this action");
      if (action === "accept" && isBuyer) throw new ForbiddenError("Cannot accept your own order");
      break;
    case "BOTH":
      if (!isBuyer && !isKurir) throw new ForbiddenError("You are not a participant in this order");
      break;
  }

  return transition.nextState;
}
