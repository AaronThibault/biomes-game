import {
  checkCallbackFailedCookie,
  clearAuthCookies,
} from "@/server/shared/auth/cookies";
import { okOrAPIError } from "@/server/web/errors";
import { biomesApiHandler } from "@/server/web/util/api_middleware";
import { zBiomesId, type BiomesId } from "@/shared/ids";
import { z } from "zod";

export const zAuthCheckResponse = z.object({
  userId: zBiomesId.optional(),
});

export type AuthCheckResponse = z.infer<typeof zAuthCheckResponse>;

export default biomesApiHandler(
  {
    auth: "optional",
    response: zAuthCheckResponse,
  },
  async (ctx) => {
    const { auth, unsafeRequest, unsafeResponse } = ctx;

    // 1. If real auth exists (cookies / OAuth), use it.
    if (auth?.userId) {
      return { userId: auth.userId };
    }

    // 2. DEV HACK: for local development, always return a stub user.
    if (process.env.NODE_ENV !== "production") {
      const devUserId = 1 as BiomesId;
      return { userId: devUserId };
    }

    // 3. Production behaviour (should never run in your local setup).
    checkCallbackFailedCookie(unsafeRequest);
    clearAuthCookies(unsafeResponse);
    okOrAPIError(auth, "unauthorized");
    return {};
  }
);
