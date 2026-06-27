import fs from "fs"; import path from "path";
const dir = "src";
let totalComponents = 0;
let memoizedComponents = 0;
let useMemoCount = 0;
let useCallbackCount = 0;

function scan(d) {
  const files = fs.readdirSync(d);
  for (const f of files) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      const content = fs.readFileSync(p, "utf-8");
      if (p.endsWith(".tsx")) {
        const matches = content.match(/export (const|function) [A-Z]/g);
        if (matches) totalComponents += matches.length;
        if (content.includes("memo(")) memoizedComponents++;
      }
      useMemoCount += (content.match(/useMemo\(/g) || []).length;
      useCallbackCount += (content.match(/useCallback\(/g) || []).length;
    }
  }
}
scan(dir);
console.log(`Components: ${totalComponents}, Memoized: ${memoizedComponents}, useMemo: ${useMemoCount}, useCallback: ${useCallbackCount}`);

