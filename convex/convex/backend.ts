//hier wird die Interaktion mit OpenAI definiert

import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";
import OpenAI from 'openai';
import { api, internal } from './_generated/api';

const openai = new OpenAI();

export const getEntries = internalQuery({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    return ctx.db.query("entries").filter(q => q.eq(q.field('adventureId'), args.adventureId))
    .collect();
  },
});
//Aktion nach drücken des Buttons
//Action
export const usePlayerInput = action({
  args: {
    message: v.string(),
    adventureId: v.id("adventures"),
  
  },
  handler: async (ctx, args) => {
//Query
    const entries = await ctx.runQuery(internal.backend.getEntries, {
      adventureId: args.adventureId,
      
    });

    const prefix = entries
      .map((entry: { input: any; response: any; }) => {
        return `${entry.input}\n\n${entry.response}`;
      })
      .join("\n\n");

    const userPrompt = args.message;

    const completion = await openai.chat.completions.create({
      messages: [{role: "user", content: `${prefix} ${userPrompt}`}],
      model: "gpt-3.5-turbo",

    });
    const input = userPrompt;
    const response = completion.choices[0].message.content ??"";
//Mutation
    await ctx.runMutation(api.backend.insertEntry, {
      input,
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