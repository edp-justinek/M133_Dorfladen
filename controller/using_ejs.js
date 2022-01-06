'use strict';
import  { Application, Router, send, Session } from "./deps.js";
import { renderFileToString } from './deps.js';
import { readJson, readJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';

// Session konfigurieren und starten
const session = new Session({ framework: "oak" });
await session.init();

const items = ["Keyboard", "Monitor", "Mouse"];0

const p = await readJson('./assets/products.json');
const products = readJsonSync('./assets/products.json');

const router = new Router();

router.get("/", async (context) => {
    try {
        context.response.body = await renderFileToString(Deno.cwd() + 
        "/views/main.ejs", { product: products });
        context.response.type = "html";           
    } catch (error) {
        console.log(error);
    }
});

router.post("/product_detail", async (context) => {
    try {
        const body = await context.request.body().value;
        const fname = body.get("first-name");
        
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/views/product_detail.ejs", { firstName: fname, itemList: items });
        context.response.type = "html";
    
    } catch (error) {
        console.log(error);
    }
});

const app = new Application();

// Session-Middleware der Applikation hinzufügen
app.use(session.use()(session));

// Router-Middleware der Applikation hinzufügen
app.use(router.routes());
app.use(router.allowedMethods());

// Diese Middleware muss nach den Routes stehen.
// Steht diese Middleware vor den Routes, werden die Routes nicht verarbeitet!
app.use(async (context) => {
    await send(context, context.request.url.pathname, {
        root: `${Deno.cwd()}/assets`,
    });
}); 

await app.listen({ port: 8000 });