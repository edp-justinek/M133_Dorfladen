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

router.post("/process",async (context) => {
    const body = await context.request.body().value;
    const firstName = body.get("first-name");
    const lastName = body.get("last-name");
    context.response.body = `
        First name: ${firstName} <br>
        Last Name: ${lastName}
    `;
    context.response.type = "html";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
