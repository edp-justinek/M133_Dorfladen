'use strict';
document.loadList = async () => {
    const response = await fetch("/api/list");
    return await response.json();
}