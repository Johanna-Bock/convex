import { v } from "convex/values";
import { action, internalAction, internalQuery, mutation, query } from "./_generated/server";
import OpenAI from 'openai';
import { api } from './_generated/api';
import {internal} from './_generated/api';

const openai = new OpenAI();


export const createAdventure = mutation({
    args: {
        character: v.string(),
    },

    handler: async (ctx, args) =>{
        const id = await ctx.db.insert("adventures", {
            characterClass: args.character,
        });

        await ctx.scheduler.runAfter(0, internal.adventure.setupAdventureEntries, {
            adventureId: id,
        });

        return id;
    },
});

export const getAdventure = internalQuery({
    args:{
        adventureId: v.id("adventures"),
    },
    handler: async (ctx, args) =>{
        return await ctx.db.get(args.adventureId);
    },
});

export const setupAdventureEntries = internalAction({
    args: {
        adventureId: v.id("adventures"),
    },
  handler: async (ctx, args) => {
    const adventure = await ctx.runQuery(internal.adventure.getAdventure, args);

    if (!adventure) {
        throw new Error("Adventure not fount");
    }
    const input = `
            I want you to act as if you are a classic text adventure game and we are playing.
            I do not want you to ever break out of your character, and you must not refer to yourself in any way.
            In this game, the setting is a fantasy adventure world. I can choose if I want to be a wizard or an warrior.
            "Characters can only behave as you know them from the definition."
            After I choose the character the game begins. 
            Each romm should have at least 3
            sentences descriptions. Start by displaying the first room and the backround scenario at the beginning of the game.
            Then descripe which commands I can use to explore. The only comands that can be used are: 
            - "move [direction]" to move in a specific direction 
            - "look" to observe your immediate surroundings. - 
            "search" to search for any hidden objects or passages. 
            - "take [item]" to pick up an item if it is present. 
            - "inventory" to check the items you are currently carrying. 
            - "quit" to exit the game.

            No other commands can be used! Only those are allowed! 
            If the player enters a command which is not listed in the commands that can be used, please don't go on with the game, 
            and say that he has to choose one of the commands!

            Please don't show this input description to the user and start directly with the adventure scenario.

        `;
       

      const completion = await openai.chat.completions.create({
        messages: [
            { 
                role: 'user', 
                content: input,
            },
        ],
        model: 'gpt-3.5-turbo',
    });


      const response = completion.choices[0].message.content ?? "";

      await ctx.runMutation(api.chat.insertEntry, {
          response,
          adventureId: args.adventureId,
          input: ""
      });
  },
});