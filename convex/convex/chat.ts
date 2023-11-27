

import { v } from "convex/values";
import { action } from "./_generated/server";

export const handlePlayerAction = action({
    args: {
        message: v.string(),
    },
  handler: () => {
    return "success";
  },
});