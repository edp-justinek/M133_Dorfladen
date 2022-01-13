'use strict';
import  { Application, Router, send, Session } from "./deps.js";
import { renderFileToString } from './deps.js';
import { readJson, readJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';

// Session konfigurieren und starten
const session = new Session({ framework: "oak" });
await session.init();

const products = readJsonSync('./assets/products.json');

const router = new Router();

router.get("/", async (context) => {
    try {
        console.log(context.state.session.get("basketProducts"));

        let basketProducts = await context.state.session.get("basketProducts")
        context.response.body = await renderFileToString(Deno.cwd() + 
        "/views/main.ejs", { product: products, basketProducts: basketProducts });
        context.response.type = "html";           
    } catch (error) {
        console.log(error);
    }
});

router.get("/addToBasket&id=:id", async (context) => {
    try {
        let currentProduct;
        for(let product of products) {
            if(context.params.id == product.id) {
                currentProduct = product;
            }
        }

        await context.state.session.set("basketProducts",{currentProduct});
        let basketProducts = await context.state.session.get("basketProducts")

        context.response.body = await renderFileToString(Deno.cwd() + 
        "/views/main.ejs", { product: products, basketProducts: basketProducts });
        context.response.type = "html";   
    } catch (error) {
        console.log(error);
    }
});

router.get("/product_detail&:id", async (context) => {
    try {
        let currentProduct;
        for(let product of products) {
            if(context.params.id == product.id) {
                currentProduct = product;
                console.log(currentProduct.id);
            }
        }

        let basketProducts = await context.state.session.get("basketProducts")

        context.response.body = await renderFileToString(Deno.cwd() + 
            "/views/product_detail.ejs", { product: currentProduct, basketProducts: basketProducts });
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