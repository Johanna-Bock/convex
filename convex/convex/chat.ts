

import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from 'openai';

const openai = new OpenAI();

export const handlePlayerAction = action({
    args: {
        message: v.string(),
    },
  handler: async (ctx, args) => {
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: args.message}],
        model: 'gpt-3.5-turbo',
      });

      console.log(completion);

    return completion;
  },
});