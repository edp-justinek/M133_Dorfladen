'use strict';
import  { Application, Router, send } from "./deps.js";
import { renderFileToString } from './deps.js';

const items = ["Keyboard", "Monitor", "Mouse"];

const router = new Router();

router.get("/", async (context) => {
    try {
        context.response.body = await renderFileToString(Deno.cwd() + 
        "/views/main.ejs", { });
        context.response.type = "html";           
    } catch (error) {
        console.log(error);
    }
});

router.post("/info", async (context) => {
    try {
        const body = await context.request.body().value;
        const fname = body.get("first-name");
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/views/info.ejs", { firstName: fname, itemList: items });
        context.response.type = "html";
    
    } catch (error) {
        console.log(error);
    }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

// Diese Middleware muss nach den Routes stehen.
// Steht diese Middleware vor den Routes, werden die Routes nicht verarbeitet!
app.use(async (context) => {
    await send(context, context.request.url.pathname, {
        root: `${Deno.cwd()}/static`,
    });
}); 

await app.listen({ port: 8000 });