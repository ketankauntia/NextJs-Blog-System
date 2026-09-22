import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

// Compile the actual OSS UI. Never copy the website layout, analytics or author directory.
export async function buildStudio(root, pkg) {
  const out = path.join(pkg, 'dist/oss');
  const seen = new Set(), css = [];
  const runtime = path.join(pkg, 'dist/studio-runtime.js');
  const relative = (from, to) => { const p = path.relative(path.dirname(from), to).replaceAll('\\', '/'); return p.startsWith('.') ? p : './' + p; };
  const resolve = name => [name, name + '.tsx', name + '.ts', name + '.js'].find(p => fs.existsSync(path.join(root, p)));
  const entries = ['components/dashboard/studio-shell.tsx', 'components/dashboard/dashboard-client.tsx', 'components/dashboard/settings-client.tsx', 'components/dashboard/font-picker-client.tsx', 'components/dashboard/preview-themes-client.tsx', 'components/editor/post-editor.tsx', 'components/editor/preview-client.tsx', 'lib/fonts.ts', 'components/blog/templates/blog-listing.tsx','app/blog/post/[slug]/page.tsx'];
  function compile(file) {
    if (seen.has(file)) return;
    seen.add(file);
    const dest = path.join(out, file.replace(/\.(tsx|ts)$/, '.js'));
    fs.mkdirSync(path.dirname(dest), {recursive:true});
    let source = fs.readFileSync(path.join(root, file), 'utf8');
    if (file.endsWith('.css')) { fs.writeFileSync(dest, source); if (!file.endsWith('.module.css')) css.push(source); return; }
    if (file === 'lib/blog/authors.ts' || file === 'lib/site.ts' || file === 'lib/product.ts') throw new Error('Website identity must not be packaged: ' + file);
    if(file==='app/blog/post/[slug]/page.tsx') {
      const imports=source.slice(0,source.indexOf('// ISR:'));
      const view=source.slice(source.indexOf('  const author = getAuthor(post.authorSlug);',source.indexOf('export default async function')));
      source=imports.replace(/import[\s\S]*?from\s*"[^"]+";/g,statement=>/"@\/lib\/(seo|blog\/content|settings|site|features)"|"@\/components\/blog\/(json-ld|product-cta|newsletter-cta)"/.test(statement)?'':statement)+
        '\nconst features={categoryPages:true,authorPages:true,tagPages:true,aiActions:true,socialShare:true};\nconst categoryToSlug=slugify, tagToSlug=slugify;\nimport {slugify} from "../../../../../core.js";\nexport function PublishedPost({post,related=[],postTemplate="standard"}) {\n'+view;
      source=source.replace('  const related = getRelatedPosts(post.slug);','').replace('  const { postTemplate } = getSettings();','').replaceAll('<PostJsonLd post={post} author={author} />','').replace('<ProductCta />','').replace('<NewsletterCta />','');
    }
    if (file === 'components/editor/post-editor.tsx') {
      source=source.replace('function blankPost(): EditablePost','function blankPost(defaultAuthor: string): EditablePost').replace('author: DEFAULT_AUTHOR_SLUG,','author: defaultAuthor,').replaceAll('blankPost()','blankPost(authorSlugs[0] || "")');
      source = source.replace('import { DEFAULT_AUTHOR_SLUG } from "@/lib/blog/authors";', 'const DEFAULT_AUTHOR_SLUG = "";')
        .replace('import { siteConfig } from "@/lib/site";', 'const siteConfig = {url: "https://example.com", name: ""};')
        .replace(/body: "## First section\\n\\nStart writing.*?",/, 'body: "",')
        .replace('window.open(`/dashboard/editor/preview?key=${encodeURIComponent(key)}`', 'window.open(studioRuntime.href(`/dashboard/editor/preview?key=${encodeURIComponent(key)}`)')
        .replace('const autosaveKey = (slug: string) => `be-editor:autosave:${slug || "__new__"}`;', 'const autosaveKey = (slug: string) => `${studioRuntime.studioHref}:autosave:${slug || "__new__"}`;');
      source=source.replace(/const serpHost = \(\(\) => \{[\s\S]*?\}\)\(\);/,'')
       .replace(/(function SerpPreview\([^\n]+\) \{)/,'$1\n const {siteUrl,name}=useStudioRuntime();\n const serpHost=siteUrl ? new URL(siteUrl).host : "Your website";')
       .replace('`Post title | ${siteConfig.name}`','`Post title | ${name}`');
    }
    if(file==='components/editor/image-dialog.tsx') source=source.replaceAll('PNG, JPG, WebP, AVIF, GIF, or SVG','PNG, JPG, WebP, or GIF');
    if (file === 'components/editor/preview-client.tsx') source = source.replace('`be-editor:autosave:${key}`', '`${studioRuntime.studioHref}:autosave:${key}`');
    if (file === 'components/dashboard/studio-shell.tsx') source = source.replace('href="/dashboard" className={styles.brand}', 'href={studioRuntime.homeHref} className={styles.brand}').replace('<span className={styles.brandName}>Next.js Blog</span>', '<span className={styles.brandName}>{studioRuntime.name}</span>').replace('aria-label="Next.js Blog Studio home"','aria-label={studioRuntime.name + " homepage"}');
    if (file === 'components/dashboard/preview-themes-client.tsx') source = source.replace('useState("/blog")', 'useState(studioRuntime.blogHref)').replace(/`\/blog\/post\/\$\{([^}]+)\}`/g, '`' + '${studioRuntime.blogHref}/post/${$1}`').replace('<SelectItem value="/blog">', '<SelectItem value={studioRuntime.blogHref}>').replace('<SelectItem value="/blog/page/2">Blog, page 2</SelectItem>', '{posts.length > 10 && <SelectItem value={studioRuntime.blogHref + "?page=2"}>Blog, page 2</SelectItem>}');
    if(file==='components/dashboard/dashboard-client.tsx') source=source.replaceAll('>/blog/post/{selected.slug}', '>{studioRuntime.blogHref}/post/{selected.slug}');
    // Each caller uses the existing secured package API through a context adapter.
    const needsRuntime = source.includes('fetch(') || source.includes('studioRuntime');
    if (needsRuntime) {
      source = source.replace(/(export function \w+\([\s\S]*?\) \{)/, '$1\n  const studioRuntime = useStudioRuntime();\n  const fetch = studioRuntime.request;');
      source += '\nimport { useStudioRuntime } from ' + JSON.stringify(relative(dest, runtime)) + ';\n';
    }
    source = source.replace(/<((?:Dialog|Select|Popover|Tooltip|DropdownMenu)Primitive)\.Portal(?=[\s>])/g, '<$1.Portal container={typeof document === "undefined" ? undefined : document.querySelector(".bsn-oss")}');
    const result = ts.transpileModule(source, {fileName:file, compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    let output = result.replace(/(from\s*|import\s*(?:\(\s*)?)(["'])([^"']+)\2/g, (all, prefix, quote, spec) => {
      if (spec === 'next/link') return prefix + JSON.stringify(relative(dest, path.join(pkg,'dist/studio-link.js')));
      if (spec === 'next/navigation') return prefix + JSON.stringify(relative(dest, path.join(pkg,'dist/studio-navigation.js')));
      if (spec === '@/lib/seo') return prefix + JSON.stringify(relative(dest, path.join(pkg,'dist/studio-seo.js')));
      if (spec === '@/lib/blog/authors') return prefix + JSON.stringify(relative(dest,path.join(pkg,'dist/public-author.js')));
      if (spec === 'next/image') return prefix + JSON.stringify(relative(dest, path.join(pkg,'dist/studio-image.js')));
      if (spec.startsWith('@/') || spec.startsWith('.')) {
        if (spec.includes('studio-runtime.js')||spec==='../../../../../core.js') return all;
        const name = spec.startsWith('@/') ? spec.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
        const target = resolve(name); if (!target) throw new Error('Unresolved UI dependency: ' + file + ': ' + spec);
        compile(target);
        if (target.endsWith('.css') && !target.endsWith('.module.css')) return ''; // compiled once below
        return prefix + JSON.stringify(relative(dest, path.join(out,target.replace(/\.(tsx|ts)$/,'.js'))));
      }
      return all;
    });
    fs.writeFileSync(dest, output);
  }
  entries.forEach(compile);
  const input = fs.readFileSync(path.join(root,'app/globals.css'),'utf8').replace('@import "tailwindcss";', '@import "tailwindcss" source(none);') + '\n' + css.join('\n') + '\n@source "../components";';
  const built = await postcss([tailwind({base:root, optimize:false})]).process(input,{from:path.join(root,'app/package-studio.css')});
  // Scope the compiled reset, tokens and utilities, including portal children.
  built.root.walkRules(rule => {
    if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map(s => {
      if (s.includes('&')) return s;
      if(s.startsWith('[data-font=')) return '.bsn-oss'+s+', :where(.bsn-oss) '+s;
      if (/^(:root|:host|html|body)(?=$|[\s,:.#\[])/.test(s)) return s.replace(/^(:root|:host|html|body)/, '.bsn-oss');
      return ':where(.bsn-oss) ' + s;
    });
  });
  fs.writeFileSync(path.join(pkg,'dist/studio.css'), built.root.toString() + '\n.bsn-oss {min-width:0;width:100%;color:var(--foreground);background:var(--background);font-family:var(--font-geist-sans),sans-serif;}\n.bsn-publication{font-family:var(--font-body-active),sans-serif;} .bsn-publication>.bsn-topbar,.bsn-publication>footer{max-width:74rem;margin:auto;padding:24px;display:flex;justify-content:space-between;gap:24px}.bsn-publication>.bsn-topbar nav{display:flex;gap:16px}\n');
  console.log(`Compiled ${seen.size} original OSS UI modules with scoped design-system CSS.`);
}
