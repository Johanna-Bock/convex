import { v } from "convex/values";
import { mutation } from "./_generated/server";



export const createAdventure = mutation({
    //args:{
     //   input: v.string(),
     //   response: v.string(),
    //},
    handler: async (ctx) =>{
        await ctx.db.insert("adventures", {
            characterClass: "warrior",
        });
    },
});