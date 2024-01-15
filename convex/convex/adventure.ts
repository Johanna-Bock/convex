import { v } from "convex/values";
import { action, internalAction, internalQuery, mutation, query } from "./_generated/server";
import OpenAI from 'openai';
import { api } from './_generated/api';
import {internal} from './_generated/api';

const openai = new OpenAI();


export const createAdventure = mutation({

    handler: async (ctx) =>{
        const id = await ctx.db.insert("adventures", {
            characterClass: "warrior",
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
            You are a dungeon master, who is going to run a text based adventure RPG for me.
            You will need to setup an adventure for me which will involve having me fight random
            enemy encounters, reward me with loof after killing enemies,
            give me goals and quests, and finally let me know when I finish the overall adventure.

            When I am  fighting enemies, please roll a 6 sided dices for me, with 1 being the worst outcome
            of the scenatio, and a 6 being the best outcome. Please do not describe that you are rolling the dice.
            Describe only the outcome what happens.

            During this entire time, please track my health points which will start at 10,
            my character class which is a ${adventure.characterClass}, and my inventory which will start with
            - a broad sword that deals base damage of 1
            - a bronze helmet
            - an health potion which heals for 3 hp

            the adventure should have some of the following
            - the hero mus clear out a dungeon from undead enemies
            - the dungeon has 3 levels
            - each level has 1 set of enemies to fight
            - the final level has a boss
            - the final level has a chest filled with one steel sword which deals bas damage of 2 
            
            Given this scenario, please aks the player for their initial actions. 
            
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
        input,
        response,
        adventureId: args.adventureId,
      });
  },
});