import { v } from "convex/values";
import { internalAction, internalQuery, mutation } from "./_generated/server";
import OpenAI from 'openai';
import { api, internal } from './_generated/api';

const openai = new OpenAI();

export const createAdventure = mutation({
    args: {
        scenario: v.string(),
        character: v.string(),
        playerName: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("adventures", {
            scenarioClass: args.scenario,
            character: args.character,
            playerName: args.playerName,
        });

        await ctx.scheduler.runAfter(0, internal.adventure.setupAdventureEntries, {
            adventureId: id,
            scenario: args.scenario,
            character: args.character,
            playerName: args.playerName,
        });

        return id;
    },
});

export const getAdventure = internalQuery({
    args:{
        adventureId: v.id("adventures"),
    },
    handler: async (ctx: { db: { get: (arg0: any) => any; }; }, args: { adventureId: any; }) =>{
        return await ctx.db.get(args.adventureId);
    },
});

export const setupAdventureEntries = internalAction({
    args: {
        adventureId: v.id("adventures"),
        scenario: v.string(),
        character: v.string(),
        playerName: v.string(),
    },
    handler: async (ctx, args) => {
        let input = ""; // Definieren Sie den Input

        // Generieren Sie verschiedene Inputs basierend auf dem ausgewählten Character
        switch (args.scenario) {
            case "fantasy":
                
                input = ` Use ${args.character} and ${args.playerName} to integrate it in the adventure.
                I want you to act as if you are a classic text adventure game and we are playing.
                In the inventory only six items are allowed maximal.
                I do not want you to ever break out of your character, and you must not refer to yourself in any way.
                In this game, the setting is a fantasy adventure world. Each room should have at least 3 sentences descriptions. 
                After that only the described commands are allowed.
                Start by displaying the first room and the background scenario at the beginning of the game.
                Then describe which commands I can use to explore. The only commands that can be used are: 
                - "move [direction]" to move in a specific direction 
                - "look" to observe your immediate surroundings.
                - "search" to search for any hidden objects or passages.
                - "take [item]" to pick up an item if it is present.
                - "inventory" to check the items you are currently carrying.
                - "quit" to exit the game.
    
                No other commands can be used by the player!  When another command is used by the player, please don't go on with the game, 
                and say that he has to choose one of the commands!
   
                Please don't show this input description to the user and start directly with the adventure scenario:
                
                `;
                
                break;
            case "future":
                input = ` you are a ${args.character}. 
                Wälder mit schönstem Grün, Luft der
                saubersten Art, Wasser der erfrischend-
                sten Sorte, Himmel mit dem schönsten
                Blau, Früchte so saftig wie nichts
                anderes, die interessantesten Inseln,
                Berge höchster Größe und ein Kampf
                der schlimmsten Art - das ist Berania!
                Es herrscht Krieg zwischen den
                Menschen, den Orks und den Eemen.
                Karsas, ein mächtiger Herrscher, der
                zu Menschen äußerst nett reagiert,
                will alle Eemen und Orks aussterben
                lassen. Jedoch sind beide Rassen
                sehr schwer zu besiegen. Zum einen
                sind die Eemen (Mischung aus Menschen
                und den ausgerotteten Elfen) schlau
                und benutzen viel von ihrer Magie,
                zum anderen sind sie im Kampf fast
                genauso kalt wie die unglaublich
                starken und brutalen Orks, die neben
                vielen gewonnenen Schlachten auch viele
                Niederlagen zu "leiden" hatten.
                Allerdings sind keiner dieser Rassen
                wirklich schlechtmütig.
                Aber Karsas will, dass nur die Menschen
                überleben...          ___
                Eines Tages stehen jedoch zwei fin-
                stere Gestalten vor deiner Tür.
                Als du sie herein lässt, findest du
                heraus wer es ist : Deine Halbschwester
                Banshi, die Eeme und ihr Kumpane
                Morgul, ein Ork. Ihr beschließt diesen
                sinnlosen Krieg zu stoppen, es hat
                schon zu viele Leben gekostet!
                
                `;
                break;
            case "zork":
                input = `Use ${args.character} and ${args.playerName} to integrate it in the adventure.
                
                `;
                break;
            default:
                input = `
                    Standard-Input für unbekannten Character.
                `;
                break;
        }

        // Weitere Verarbeitung des Inputs, z. B. mit OpenAI
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
