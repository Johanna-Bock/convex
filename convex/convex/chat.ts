

import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";
import OpenAI from 'openai';
import { api, internal } from './_generated/api';


const openai = new OpenAI();

export const getEntriesForAdventure = internalQuery({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    return ctx.db.query("entries").filter(q => q.eq(q.field('adventureId'), args.adventureId))
    .collect();
  },
});

export const handlePlayerAction = action({
  args: {
      message: v.string(),
      adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
      const entries = await ctx.runQuery(internal.chat.getEntriesForAdventure, {
          adventureId: args.adventureId,
      });

      // Prefix the existing entries to create context for the AI
      const prefix = entries.map(entry => `${entry.input}\n\n${entry.response}`).join("\n\n");
      const userPrompt = args.message;

      // Combine the prefix and the user prompt for AI completion
      const combinedPrompt = `${prefix} ${userPrompt}`;

      // Valid commands allowed in the game
      const validCommands = [
          "move [direction]",
          "wizard",
          "warrior",
          "look",
          "search",
          "take [item]",
          "inventory",
          "quit"
      ];

      // Extract the command from the user message
      const command = args.message.split(" ")[0].toLowerCase();

      // Check if the command is valid
      if (!validCommands.includes(command)) {
          // If the command is invalid, inform the player to choose a valid command
          const invalidCommandResponse = "Please choose a valid command: move [direction], look, search, take [item], inventory, quit";

          // Save the input message and invalid command response
          await ctx.runMutation(api.chat.insertEntry, {
              input: args.message,
              response: invalidCommandResponse,
              adventureId: args.adventureId,
          });
          return;
      }

      // If the command is valid, proceed with the AI completion
      const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: combinedPrompt }],
          model: "gpt-3.5-turbo",
      });

      const response = completion.choices[0].message.content ?? "";

      // Save the input message and AI response
      await ctx.runMutation(api.chat.insertEntry, {
          input: args.message,
          response,
          adventureId: args.adventureId,
      });
  },
});


export const insertEntry = mutation({
    args:{
        input: v.string(),
        response: v.string(),
        adventureId: v.id("adventures"),
    },
    handler: async (ctx, args) =>{
        await ctx.db.insert("entries", {
            input: args.input,
            response: args.response,
            adventureId: args.adventureId,
        });
    },
});

export const getAllEntries = query({
  args: {
    adventureId: v.id("adventures"),
  },
    handler: async (ctx, args) => {
        const entries = await ctx.db
        .query("entries")
        .filter(q => q.eq(q.field("adventureId"), args.adventureId))
        .collect();
        return entries;
    },
});