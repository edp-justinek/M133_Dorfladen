'use strict';
import { Application, Router, renderFileToString, validate, required, isEmail, isNumeric, lengthBetween, firstMessages, flattenMessages} from "./deps.js";

const router = new Router();

router.all("/" , async(context) => {
    const body = await context.request.body().value;
    if (body) {
        console.log("The form has been submitted");
        const inputs = Object.fromEntries(body);
        const [ passes, errors ] = await validate(inputs, {
            username: [required, lengthBetween(5, 10)],
            email: [required, isEmail],
            age: [required, isNumeric],
        });
        if (passes) {
            console.log("Validation successful!"); 
            context.cookies.set("userData", JSON.stringify(inputs)); 
            context.response.redirect("/info");          
        }
        else {
            const firstErrors = firstMessages(errors);
            const flattenErrors = flattenMessages(errors);

            console.log({ errors, firstErrors, flattenErrors });

            const errorMessages = Object.values(firstErrors);
            context.response.body = await renderFileToString(Deno.cwd() + 
                "/views/main.ejs", { errors: errorMessages });            
        }
    }
    else {
        console.log("No form submission");
        context.response.body = await renderFileToString(Deno.cwd() + 
            "/views/main.ejs", { errors: [] });
    }
});

router.get("/info" , async(context) => {
    const jsonData = context.cookies.get("userData");
    const objectData = JSON.parse(jsonData);

    // const entries = Object.entries(objectData); funktioniert nicht korrekt

    const keysData = Object.keys(objectData);
    const valuesData = Object.values(objectData);

    context.response.body = await renderFileToString(Deno.cwd() + 
        "/views/info.ejs", { keys: keysData, values: valuesData });
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });