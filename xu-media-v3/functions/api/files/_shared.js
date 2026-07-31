export const CATEGORIES = new Set(["models","templates","backgrounds","backsounds","logos","overlays","voices","fonts","outputs"]);
export const clean = v => String(v || "").trim().toLowerCase();
export function safeName(v) {
  return String(v || "file").normalize("NFKC").replace(/[\/\\?%*:|"<>]/g,"-")
    .replace(/[\u0000-\u001f\u007f]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^\.+/,"").slice(0,180) || "file";
}
export const bad = (message,status=400)=>Response.json({error:message},{status});
