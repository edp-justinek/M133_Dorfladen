'use strict';

import { Application , Router} from "./deps.js";

const router = new Router();

router.get("/", (context) => {
  context.response.body = "Homepage";
});

router.get("/login", (context) => {
  context.response.body = "Login page";
});

router.get("/info/:id", (context) => {
  context.response.body = "Info " + context.params.id;
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
