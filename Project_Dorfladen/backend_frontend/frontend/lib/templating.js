'use strict';
import { uuid } from "./uuid.js"

const renderText = (textEl, valueObj) => textEl.replace(
    /\{\{\W*([\.\w\d]+)\W*\}\}/g,
    (_, toReplace) => {
        const parts = toReplace.split(".");
        let value = valueObj;
        parts.forEach(part => value = value[part]);
        return value;
    });

const render = (element, valueObj) => {
    if (element.nodeType === Node.TEXT_NODE) {
        element.textContent = renderText(element.textContent, valueObj);
    } else {
        element.childNodes.forEach(child => render(child, valueObj));
    }

    if (element.attributes) {
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attr.value = renderText(attr.value, valueObj);
        }
    }
}

export const append = (template, valueObj, parent) => {
    const li = document.importNode(template.content.firstElementChild, true);
    li.setAttribute("data-templating", "templating");
    const valueObjClone = JSON.parse(JSON.stringify(valueObj));
    render(li, valueObjClone);
    li.querySelectorAll("script[type='module']").forEach(scr => {
        const id = uuid();
        scr.setAttribute("data-scriptId", id);
        for (const key in valueObj) {
            if (valueObj.hasOwnProperty(key)) {
                const json = JSON.stringify(valueObj[key]);
                scr.innerText = `const ${key} = ${json};` + scr.innerText;
            }
        }
        scr.innerText = `const scope = document.querySelector("[data-scriptId='${id}']").parentElement;` + scr.innerText;
    });
    if (parent) {
        parent.appendChild(li);
    } else {
        template.parentElement.appendChild(li);
    }
    return li;
}

export const prepare = () => {
    document.querySelectorAll("[data-templating='templating']").forEach(el => el.remove());
}

export const init = () => {
    prepare();

    const initFor = (el, vObj) => {
        el.querySelectorAll("template[data-template-foreach]").forEach(async t => {
            const funcName = t.getAttribute("data-template-foreach");
            const letName = t.getAttribute("data-template-let");
            const resultArray = await document[funcName](vObj);
            for (let i = 0; i < resultArray.length; i++) {
                const element = resultArray[i];
                const valueObj = Object.assign({ [letName]: element }, vObj);
                const newElement = append(t, valueObj);
                initFor(newElement, valueObj);
            }
        });
    }
    
    initFor(document, {});
}