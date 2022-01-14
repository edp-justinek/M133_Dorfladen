'use strict';
import  { Application, Router, send, Session } from "./deps.js";
import { renderFileToString } from './deps.js';
import { readJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';

// Session konfigurieren und starten
const session = new Session({ framework: "oak" });
await session.init();

const products = readJsonSync('./assets/products.json');

const router = new Router();

let basket = [];

router.get("/", async (context) => {
    try {

        if(await context.state.session.get("basketProducts") !== undefined){
            basket = await context.state.session.get("basketProducts")
        } 

        console.log(basket);

        context.response.body = await renderFileToString(Deno.cwd() + 
        "/views/main.ejs", { product: products, basket: basket });
        context.response.type = "html";           
    } catch (error) {
        console.log(error);
    }
});

router.get("/addToBasket&:id", async (context) => {
    try {
      
        let currentProduct = getSelectedProduct(context.params.id);

        basket.push({title: currentProduct.productName, price: currentProduct.specialOffer})
        await context.state.session.set("basketProducts", basket);

        context.response.redirect("/");
    } catch (error) {
        console.log(error);
    }
});

router.get("/product_detail&:id", async (context) => {
    try {

        let currentProduct = getSelectedProduct(context.params.id);
        
        if(await context.state.session.get("basketProducts") !== undefined){
            basket = await context.state.session.get("basketProducts")
        } 

        context.response.body = await renderFileToString(Deno.cwd() + 
            "/views/product_detail.ejs", { product: currentProduct, basket: basket });
        context.response.type = "html";
    } catch (error) {
        console.log(error);
    }
});

function getSelectedProduct(id) {
    for(let product of products) {
        if(id == product.id) {
            return product;
        }
    }
}

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