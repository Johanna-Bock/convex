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
        let input = ""; // Definieren des Inputs

        // Generieren verschiedenre Inputs 
        switch (args.scenario) {
            case "Kriminalgeschichte":
                
                input = `Ich möchte dass du dich so verhälst als wärst du ein klassiches Textadventure Spiel
                und wir spielen.
Du bist Dungeon Master und ich der Spieler.
Ich möchte, dass du niemals deinen Charakter verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhältst.
Jedes Szenario wird von dir mit maximal vier Sätzen beschrieben.
Du darfst nicht für den Spieler entscheiden, was als nächstes passiert.
Das Szenario, das du dem Spieler beschreibst, sieht folgendermaßen aus:
Ich als Spieler befindet sich in einem mysteriösen Kriminalfall den du beschreibst.
mein Name ist ${args.playerName} und ich bin ein ${args.character}.
Das Textadventure wird von dir erst beendet, wenn der Spieler den Kriminalfall erfolgreich gelöst hat oder wenn der Spieler in einem Kampf stirbt.
Beschreibe zuerst die Szene dann beginnt das Abenteuer.

              
                
                `;
                
                break;
            case "Fantasy":
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
                Erstelle aus diesem Input ein Textadventure mit einem Ziel dass es zu erreichen gilt.
                Auf dem Weg dorthin stellst du mich immer wieder vor spannende Aufgaben und Gefahren.
                Du bist Dungeon Master und ich der Spieler.
                Ich als spieler habe den Character ${args.character} und den Namen ${args.playerName}.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.
                Jedes Szenario wird von dir mit mindestens drei und maximal vier Sätzen beschrieben.
                Du darfst nicht für den Spieler entscheiden was als nächstes passiert. 
                Das Abenteuer ist erst beendet wenn ich das Ziel des Abenteuers erreicht habe oder in einem Kampf sterbe.
                Beschreibe zuerst die Szene dann beginnt das Abenteuer.

                                

                `;
                break;
            case "Zork":
                input = `
                Wir spielen zusammen das klassische Textadventure Spiel Zork!
                Du bist Dungeon Master und ich der Spieler.
                Ich als spieler habe den Character ${args.character} und den Namen ${args.playerName}.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.
                Jedes Szenario und jede Antwort wird von dir mit maximal vier Sätzen durch dich beschrieben.
                Du darfst nicht für den Spieler entscheiden was als nächstes passiert. 
                Das Szenario das du dem Spieler beschreibst sieht folgendermaßen aus:
                Der Spieler steht auf freiem Feld westlich von einem weißen Haus, dessen Haustür mit Brettern vernagelt ist.
Er sieht einen Briefkasten. der Name des Spielers ist ${args.playerName} und er ist ein ${args.character}.
                    In dem Haus befindet sich ein Dungeon. Das erzählst du mir aber nicht. Darin muss ich Gegner töten und jemanden befreien.
                    Beschreibe zuerst die Szene dann beginnt das Abenteuer.
                    Denke dir passend zu diesem Szenario ein Textadventure aus.
                    Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.

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
