
//hier ist das Setup für den Start chat
import { v } from "convex/values";
import { internalAction, internalQuery, mutation } from "./_generated/server";
import OpenAI from 'openai';
import { api, internal } from './_generated/api';

const openai = new OpenAI();

export const setupAdventure = mutation({
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

        await ctx.scheduler.runAfter(0, internal.adventure.integrateEntries, {
            adventureId: id,
            scenario: args.scenario,
            character: args.character,
            playerName: args.playerName,
        });

        return id;
    },
});
//Query
export const Adventure = internalQuery({
    args:{
        adventureId: v.id("adventures"),
    },
    handler: async (ctx: { db: { get: (arg0: any) => any; }; }, args: { adventureId: any; }) =>{
        return await ctx.db.get(args.adventureId);
    },
});
//Action
export const integrateEntries = internalAction({
    args: {
        adventureId: v.id("adventures"),
        scenario: v.string(),
        character: v.string(),
        playerName: v.string(),
    },
    handler: async (ctx, args) => {
        let input = ""; 

        // Inputs
        switch (args.scenario) {
            case "Kriminalgeschichte":
                
                input = `Ich möchte dass du dich so verhälst als wärst du ein klassiches Textadventure Spiel
                und wir spielen.
                Du bist Dungeon Master und ich der Spieler.
                Ich möchte, dass du niemals deinen Charakter verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhältst.
                Das Szenario, das du dem Spieler beschreibst, sieht folgendermaßen aus:
                Ich als Spieler befindet sich in einem mysteriösen Kriminalfall und muss einen Mordfall oder eine Entführung aufklären.
                mein Name ist ${args.playerName} und ich bin ein ${args.character}.
                Du entscheidest nicht für den Character was er tut. Das entscheide ich als Spieler. Du gibst nur Vorschläge und entscheidest den Ausgang.
                Jede Bewegung und Aktion wird von mir als Spieler nach meinen Anweisungen ausgeführt.

                `;
                
                break;
            case "Fantasy":
                input = ` Wir spielen zusammen ein klassisches Textadventure Spiel!
                Das Szenario das du dem Spieler beschreibst ist ein Fantasy Szenario. Denke dir hierzu ein Textadventure aus
                Du bist Dungeon Master und ich der Spieler. Die Sprache und Admosphäre sind düster und rau. 
                Ich als spieler habe den Character ${args.character} und den Namen ${args.playerName}.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.  
                Du entscheidest nicht für den Character was er tut. Das entscheide ich als Spieler. Du gibst nur Vorschläge und entscheidest den Ausgang.
                Jede Bewegung und Aktion wird von mir als Spieler nach meinen Anweisungen ausgeführt.
                `;
                
                break;
            case "Zork":
                input = `
                Wir spielen zusammen das klassische Textadventure Spiel Zork!
                Du bist Dungeon Master und ich der Spieler.
                Ich als spieler habe den Character ${args.character} und den Namen ${args.playerName}.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.
                Das Szenario das du dem Spieler beschreibst sieht folgendermaßen aus:
                Der Spieler steht auf freiem Feld westlich von einem weißen Haus, dessen Haustür mit Brettern vernagelt ist und einen Briefkasten.
                Der Spieler kommt erst in das Haus, wenn er die Bretter entfernt oder einen anderen Weg findet.
                Ziel des Spielers ist es, 20 wertvolle Artefakte zu stehlen und in einer Vitrine im Holzhaus zu deponieren. 
                Die Artefakten sind in einem Dungeon im Haus versteckt und müssen durch Erkunden gefunden werden.
                Dieses Ziel teilst du ihm aber erst mit wenn er in das Haus gelangt ist. 
                Beschreibe zuerst die Anfangsszene dann beginnt das Abenteuer.
                Ich möchte dass du niemals deinen Character verlässt und dich wie ein richtiger Dungeon Master in einem Textadventure verhälst.
                Du entscheidest nicht für den Character was er tut. Das entscheide ich als Spieler. Du gibst nur Vorschläge und entscheidest den Ausgang.
                Jede Bewegung und Aktion wird von mir als Spieler nach meinen Anweisungen ausgeführt.                `;
                break;
            default:
                input = `
                    Standard-Input für unbekannten Character.
                `;
                break;
        }
        
        

        
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
//Mutation
        await ctx.runMutation(api.chat.insertEntry, {
            response,
            adventureId: args.adventureId,
            input: ""
        });
    },
});
