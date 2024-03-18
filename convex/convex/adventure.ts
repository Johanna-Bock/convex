import { v } from "convex/values";
import { internalAction, internalQuery, mutation } from "./_generated/server";
import OpenAI from 'openai';
import { api, internal } from './_generated/api';

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
            character: args.character,
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
        character: v.string(),
    },
    handler: async (ctx, args) => {
        let input = ""; // Definieren Sie den Input

        // Generieren Sie verschiedene Inputs basierend auf dem ausgewählten Character
        switch (args.character) {
            case "warrior":
                input = `
                I want you to act as if you are a classic text adventure game and we are playing.
                I do not want you to ever break out of your character, and you must not refer to yourself in any way.
                In this game, the setting is a fantasy adventure world. Each romm should have at least 3
                sentences descriptions. 
                Berfore the adventure starts, please ask the player for his name. This is a free input. The player can decide what he wants to be called.
                Please integrade it in the adventure sometimes.

                After that first input from the player only the described commands are allowed.
                Start by displaying the first room and the backround scenario at the beginning of the game.
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
    
                Please don't show this input description to the user and start directly with the adventure scenario:
            
                `;
                break;
            case "wizard":
                input = `
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
                sind die Eemen (mischung aus Menschen
                und den ausgerottenen Elfen) schlau
                und benutzen viel von ihrer Magie,
                zum anderen sind sie im Kampf fast
                genauso kalt wie die unglaublich
                starken und brutalen Orks, die neben
                vielen gewonnen Schlachten auch viele
                Niederlagen zu "leiden" hatten.
                Allerdings sind keiner dieser Rassen
                wirklich schlechtmütig.
                Aber Karsas will, daß nur die Menschen
                überleben...          ___
                Eines Tages stehen jedoch zwei fin-
                stere Gestalten vor deiner Tür.
                Als du sie herein lässt, findest du
                heraus wer es ist : Deine Halbschwester
                Banshi, die Eeme und ihr Kumpane
                Morgul, ein Ork. Ihr beschließt diesen
                sinnlosen Krieg zu stoppen, es hat
                schon zu viele Leben gekostet!
                
                                  ---
                
                Zu erst mal etwas ungewöhnliches die-
                ses Spiels : Es besteht aus zwölf (!!)
                Diskettenseiten. Man merkt schon die
                Komplexität des Programmes...
                Amos, das sind die Hersteler des
                Rollenspiels "Die Prüfung". Dort wurde
                angegeben, daß Berania, also dieses
                weitere Rollenspiel erscheinen
                würde. Plötzlich hat Kingsoft die
                Vertreibung neuer C64-Games eingestellt.
                Da "Die Prüfung" auch von Kingsoft
                vertrieben wurde, dachten die naiven
                C64-User gleich, dieses Game würde
                nicht erscheinen. Tja, gearscht!
                Falls die Verkaufszahlen die Program-
                mierer zufriedenstellen, erscheinen
                weitere Teile dieses Spiels.
                Zum Game : Die Titelgrafik und auch
                sonstige Zwischenbildchen im Spiel sind
                ordentlich gelungen. Ich sage deshalb
                "Zwischenbildchen", weil man die Grafik
                des Games nur durch ein kleines Fenster
                oben-links des Bildschirms sieht und
                man wegen der enormen Größe der Städte
                und des Landes manchmal total den
                Überblick verliert. Die Zwischenbildchen
                erscheinen eben nur im Fenster.
                Wie gesagt ist das Land recht groß und
                besteht auch aus einigen Inseln.
                Mit einer beiliegenden Karte kann man
                sich zurechtfinden.
                Man kann in Städten rumlaufen, Leute
                anlabern und wichtige Dinge erfahren,
                durch herumschnüffeln Waffen, Rationen
                usw. finden oder man kann u.v.a. auch
                handeln! Außerhalb der Städte trifft
                man auf Hooligans (nein, keine DJ's..),
                Zauberer, Soldaten etc. und diese
                können einen wirklich belästigen,
                besonders wenn man gezwungen ist, mit
                ihnen zu kämpfen und nicht flüchten
                kann. Bald dämmert's jedoch und es
                wird Nacht. Nun treten die Monster
                in Aktion und Feinde trifft man umso
                mehr. Gegen Skelette, Riesenskorpione
                etc. gibt es fast keine Chance.
                Auch kann man sich ein Schiff besorgen
                und/oder sich auf einer Insel bzw.
                anderen Teil Beranias fahren lassen.
                Das alles kostet Geld, das man durch
                Eroberungen von Kämpfen und dem Handel
                ergattern kann. Aber es gibt auch 3D-
                Dungeons,in denen wo man auch was finden
                kann... Die steuerung erfolgt per
                Joystick. Es empfiehlt sich sehr,
                Module aller Art, besonders das
                Action Replay, Final Cartridge oder
                die Nordic Power vom Expansion-Port
                zu entfernen, da sie das Laden eh nicht
                beschleunigen und zu absolut
                "überraschenden" und ärgerlichen
                Abstürzen führen können!
                Die Anleitung besteht aus 14 DinA4
                Seiten, die viel über die Story
                erzählen. Allerdings sind die Beschrei-
                bungen des Spiels etwas unklar. Nach
                genauem Durchlesen und Probieren
                gibt's jedoch keine Probleme.
erstelle hieraus ein klassisches textadventure                
                `;
                break;
            case "archer":
                input = `
                    Hier ist der Input für den Archer-Character.
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
