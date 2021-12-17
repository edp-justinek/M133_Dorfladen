'use strict';

import { Application , Router, renderFileToString} from "./deps.js";

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

await app.listen({ port: 8000 });