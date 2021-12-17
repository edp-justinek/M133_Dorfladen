'use strict';

import { Application , Router} from "./deps.js";

const router = new Router();

router.get("/", (context) => {
    context.response.body = `
        <form action="/process" method="post">
            <input type="text" name="first-name">
            <input type="text" name="last-name">
            <input type="submit" value="Submit">
        </form>
    `;
    context.response.type = "html";
});

router.post("/process", async (context) => {
    const body = await context.request.body().value;
    const firstName = body.get("first-name");
    const lastName = body.get("last-name");

    context.cookies.set("fname", firstName);
    context.cookies.set("lname", lastName);

    context.response.body = `
        First name: ${firstName} <br>
        Last name: ${lastName} <br><br>
        <a href="/show">Enter</a>
    `;
    context.response.type = "html";
});

router.get("/show", (context) => {
    const firstName = context.cookies.get("fname");
    const lastName = context.cookies.get("lname");
    context.response.body = `Welcome ${firstName} ${lastName}!`;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });