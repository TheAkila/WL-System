import fs from 'fs';
const path = "src/components/technical/SessionSheet.jsx";
let text = fs.readFileSync(path, 'utf8');

// The best way to make the table span the entire height of its flex parent is `h-full` on the `table` itself
// If we had turned it into standard flex column it'll break all standard column layouts.
// Reversing the complex flex rows back to standard `tr` elements with `h-full` to distribute the space using natural table flow.

text = text.replace(/className={`\$\{isFullscreen \? 'flex-1 flex flex-col h-full' : ''\} w-full border-collapse bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600`}/g,
"className={`w-full ${isFullscreen ? 'h-full' : ''} border-collapse bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600`}");

text = text.replace(/<thead className=\{isFullscreen \? 'flex flex-col flex-none' : ''\}>/g, "<thead>");
text = text.replimport fs from 'fs';
const path = "src/components/technical/SessionSheet.jsx";
let text = fs.readFileSync(path, ce(/<tr\n\s*key=\{athlete\.id\} className={`\$\{isFullscreen \? 'flex flex-1 cont
// The best way to make the table -2 borde// If we had turned it into standard flex column it'll break all standard column layouts.
// Reversing the c k// Reversing the complex flex rows back to standard `tr` elements with `h-full` to distr50
text = text.replace(/className={`\$\{isFullscreen \? 'flex-1 flex flex-col h-full' : ''\} w-full border-collapse bg-white dark:o' "className={`w-full ${isFullscreen ? 'h-full' : ''} border-collapse bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600`}");

text = text.replace(/<thead className=\{isnt
text = text.replace(/<thead className=\{isFullscreen \? 'flex flex-col flex-none' : ''\}>/g, "<thead>");
text = text.replimport fs from 'f'flex ftext = text.replimport fs from 'fs';
const path = "src/components/technical/SessionSc(path, text);
