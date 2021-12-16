'use strict';

import { Application , Router, Session} from "./deps.js";

// Session konfigurieren und starten
const session = new Session({ framework: "oak" });
await session.init();

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

    await context.state.session.set("firstLastName", {"fname": firstName, "lname": lastName})
 
    context.response.body = `
        First name: ${firstName} <br>
        Last name: ${lastName} <br><br>
        <a href="/show">Enter</a>
    `;
    context.response.type = "html";
});

router.get("/show", async (context) => {
    const session = await context.state.session.get("firstLastName");
    console.log(session);
    const firstName = session.fname;
    const lastName = session.lname;
    context.response.body = `Welcome ${firstName} ${lastName}!`;
});

const app = new Application();

// Session-Middleware der Applikation hinzufügen
app.use(session.use()(session));

// Router-Middleware der Applikation hinzufügen
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });