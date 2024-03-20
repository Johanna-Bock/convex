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

        // Generieren Sie verschiedene Inputs 
        switch (args.scenario) {
            case "mystery":
                
                input = ` 
                Wir spielen zusammen das klassische Textadventure Spiel!
                Du bist Dungeon Master und ich der Spieler.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.
                Jedes Szenario wird von dir mit mindestens drei und maximal vier Sätzen beschrieben.
                Du darfst nicht für den Spieler entscheiden was als nächstes passiert. 
                Das Szenario das du dem Spieler beschreibst sieht folgendermaßen aus:
                Wir befinden uns in einem mysteriösen Kriminalfall.
                der Name des Spielers ist ${args.playerName} und er ist ein ${args.character}.
               Du entscheidest nicht für den Spieler!  Als Dungeon Master sprichst du den Spiler direkt an.

              
                
                `;
                
                break;
            case "fantasy":
                input = ` Wir spielen zusammen ein klassisches Textadventure Spiel!
                
                Das Szenario das du dem Spieler beschreibst sieht folgendermaßen aus:
                "Wälder, Wasser, Früchte,
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
                Niederlagen zu "leiden" hatten."
                Erstelle aus diesem Input ein Textadventure mit spannenden Abenteuern.
                Du bist Dungeon Master und ich der Spieler.
                Ich als spieler habe den Character ${args.character} und den Namen ${args.playerName}.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.
                Jedes Szenario wird von dir mit mindestens drei und maximal vier Sätzen beschrieben.
                Du darfst nicht für den Spieler entscheiden was als nächstes passiert. 
                                
                Du reagierst auf meine Antworten als richtiger Dungeon Master eines klassischen Textadventures!

                `;
                break;
            case "zork":
                input = `
                Wir spielen zusammen das klassische Textadventure Spiel Zork!
                Du bist Dungeon Master und ich der Spieler.
                Ich als spieler habe den Character ${args.character} und den Namen ${args.playerName}.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.
                Jedes Szenario wird von dir mit mindestens drei und maximal vier Sätzen beschrieben.
                Du darfst nicht für den Spieler entscheiden was als nächstes passiert. 
                Das Szenario das du dem Spieler beschreibst sieht folgendermaßen aus:
                Der Spieler steht auf freiem Feld westlich von einem weißen Haus, dessen Haustür mit Brettern vernagelt ist.
Er sieht einen Briefkasten. der Name des Spielers ist ${args.playerName} und er ist ein ${args.character}.
               Du entscheidest nicht für den Spieler!  Als Dungeon Master sprichst du den Spiler direkt an.
                
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
