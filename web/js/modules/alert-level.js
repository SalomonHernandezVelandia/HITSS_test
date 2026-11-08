
export function normalizeAlertLevel(value) {
    const level = String(value || "NORMAL")
        .trim()
        .toUpperCase();

    if (level === "CRITICO" || level === "CRÍTICO") {
        return "CRITICO";
    }

    if (level === "WARN" || level === "WARNING") {
        return "WARN";
    }

    return "NORMAL";
}
