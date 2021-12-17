'use strict';
export function uuid() {
    const rnds = crypto.getRandomValues(new Uint8Array(16));

    rnds[6] = (rnds[6] & 0x0f) | 0x40; // Version 4
    rnds[8] = (rnds[8] & 0x3f) | 0x80; // Variant 10

    return bytesToUuid(rnds);
}

export function bytesToUuid(bytes) {
    const bits = [...bytes].map((bit) => {
        const s = bit.toString(16);
        return bit < 0x10 ? "0" + s : s;
    });
    return [
        ...bits.slice(0, 4),
        "-",
        ...bits.slice(4, 6),
        "-",
        ...bits.slice(6, 8),
        "-",
        ...bits.slice(8, 10),
        "-",
        ...bits.slice(10, 16),
    ].join("");
}

export function uuidToBytes(uuid) {
    const bytes = [];

    uuid.replace(/[a-fA-F0-9]{2}/g, (hex) => {
        bytes.push(parseInt(hex, 16));
        return "";
    });

    return bytes;
}