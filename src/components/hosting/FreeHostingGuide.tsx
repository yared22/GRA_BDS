import React, { useState } from 'react';
import { 
  Server, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  Terminal, 
  Globe, 
  ShieldCheck, 
  FileCode2, 
  Zap, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const FreeHostingGuide: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'vercel' | 'netlify' | 'github' | 'cloudflare'>('vercel');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-2xl border border-indigo-500/30 text-white shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Globe className="w-4 h-4" />
          <span>Zero-Cost Production Deployment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          How to Host This System on 100% Free Hosting Tools
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl">
          This modern Vite + React application is pre-configured with portable relative paths (<code className="text-amber-400 font-mono">base: './'</code>), 
          automatic client-side routing (<code className="text-amber-400 font-mono">_redirects</code> & <code className="text-amber-400 font-mono">vercel.json</code>), 
          and zero external backend requirements. You can deploy it on free cloud tiers in under 2 minutes.
        </p>

        {/* Platform Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-indigo-900/60 text-xs">
          <button
            onClick={() => setActivePlatform('vercel')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePlatform === 'vercel'
                ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-lg'
                : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="block font-extrabold text-sm">1. Vercel</span>
            <span className="text-[11px] opacity-80">Easiest 1-Click Deploy</span>
          </button>

          <button
            onClick={() => setActivePlatform('netlify')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePlatform === 'netlify'
                ? 'bg-teal-600 text-white border-teal-400 font-bold shadow-lg'
                : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="block font-extrabold text-sm">2. Netlify</span>
            <span className="text-[11px] opacity-80">Drag & Drop or Git</span>
          </button>

          <button
            onClick={() => setActivePlatform('github')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePlatform === 'github'
                ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-lg'
                : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="block font-extrabold text-sm">3. GitHub Pages</span>
            <span className="text-[11px] opacity-80">100% Free with Repo</span>
          </button>

          <button
            onClick={() => setActivePlatform('cloudflare')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePlatform === 'cloudflare'
                ? 'bg-amber-600 text-white border-amber-400 font-bold shadow-lg'
                : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="block font-extrabold text-sm">4. Cloudflare</span>
            <span className="text-[11px] opacity-80">Unlimited Bandwidth</span>
          </button>
        </div>
      </div>

      {/* PLATFORM 1: VERCEL */}
      {activePlatform === 'vercel' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>Recommended Option</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Deploy on Vercel (Free Forever Tier)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero configuration needed. Vercel gives you instant HTTPS, custom domain support, and lightning-fast global CDN.
              </p>
            </div>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center space-x-1 shadow"
            >
              <span>Open Vercel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            {/* Method A: Via Git */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">A</span>
                <span>Method A: Import via GitHub / GitLab / Bitbucket (Easiest)</span>
              </span>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Push your codebase to your GitHub account (or export and push).</li>
                <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">vercel.com/new</a> and click <strong>&ldquo;Import&rdquo;</strong> next to your repository.</li>
                <li>Vercel automatically detects <strong>Vite</strong>. The default settings are already pre-filled:
                  <ul className="list-disc pl-5 mt-1 font-mono text-[11px] text-slate-500">
                    <li>Framework Preset: <code>Vite</code></li>
                    <li>Build Command: <code>npm run build</code></li>
                    <li>Output Directory: <code>dist</code></li>
                  </ul>
                </li>
                <li>Click <strong>&ldquo;Deploy&rdquo;</strong>. In about 30 seconds, your site is live with a free <code>*.vercel.app</code> URL and SSL certificate!</li>
              </ol>
            </div>

            {/* Method B: Via CLI */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">B</span>
                  <span>Method B: Deploy directly from your Terminal</span>
                </span>
                <button
                  onClick={() => handleCopy('npx vercel', 'vercel-cli')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  {copiedId === 'vercel-cli' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Command</span>
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Run this single command in your terminal from the project folder:
              </p>
              <div className="bg-slate-950 text-emerald-400 p-3 rounded-lg font-mono text-[11px]">
                $ npx vercel
              </div>
              <p className="text-slate-500 text-[11px]">
                Accept default prompts by pressing Enter. It will build and output your production URL immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM 2: NETLIFY */}
      {activePlatform === 'netlify' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Instant Drag-and-Drop or Git</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Deploy on Netlify (Free Forever Tier)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Netlify offers 100GB/month bandwidth on its free plan, instant rollbacks, and zero configuration.
              </p>
            </div>
            <a
              href="https://app.netlify.com/drop"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center space-x-1 shadow"
            >
              <span>Netlify Drop</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            {/* Method A: Drag and Drop */}
            <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-500/30 space-y-2">
              <span className="font-extrabold text-teal-950 dark:text-teal-300 text-sm block">
                Method A: Zero-Code Drag & Drop (No Git required!)
              </span>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                <li>Run <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-teal-600">npm run build</code> in your terminal. This creates a production-ready <code className="font-mono">dist/</code> folder.</li>
                <li>Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 underline font-semibold">app.netlify.com/drop</a> in your browser.</li>
                <li>Drag and drop the entire <strong>dist</strong> folder into the upload circle on Netlify.</li>
                <li>Your app is published in 10 seconds! Netlify assigns you a free URL (e.g. <code>https://my-training-portal.netlify.app</code>).</li>
              </ol>
            </div>

            {/* Method B: Netlify CLI */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Method B: Via Netlify CLI
                </span>
                <button
                  onClick={() => handleCopy('npm run build && npx netlify deploy --prod --dir=dist', 'netlify-cli')}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  {copiedId === 'netlify-cli' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Command</span>
                </button>
              </div>
              <div className="bg-slate-950 text-teal-400 p-3 rounded-lg font-mono text-[11px]">
                $ npm run build && npx netlify deploy --prod --dir=dist
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM 3: GITHUB PAGES */}
      {activePlatform === 'github' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                <FileCode2 className="w-4 h-4" />
                <span>Hosted Directly on GitHub</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Deploy on GitHub Pages (100% Free)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Host for free directly under your repository: <code className="text-purple-500 font-mono">https://username.github.io/repository-name/</code>.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/30 space-y-2">
              <span className="font-extrabold text-purple-950 dark:text-purple-300 text-sm block">
                Automated GitHub Actions Deployment (Step-by-Step)
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                1. In your GitHub repository, create a file at <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">.github/workflows/deploy.yml</code>.
              </p>
              
              <div className="relative">
                <button
                  onClick={() => handleCopy(`name: Deploy to GitHub Pages
on:
  push:
    branches: ['main']
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: 'pages'
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`, 'gh-action')}
                  className="absolute top-2 right-2 text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded hover:bg-slate-700 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedId === 'gh-action' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Workflow YAML</span>
                </button>

                <pre className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[10px] overflow-x-auto max-h-48">
{`name: Deploy to GitHub Pages
on:
  push:
    branches: ['main']
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: 'pages'
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`}
                </pre>
              </div>

              <p className="text-slate-700 dark:text-slate-300 pt-2">
                2. In GitHub repository &rarr; <strong>Settings</strong> &rarr; <strong>Pages</strong>, select <strong>Source: GitHub Actions</strong>.<br />
                3. Every time you push to <code className="font-mono">main</code>, GitHub automatically compiles and hosts your live portal!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM 4: CLOUDFLARE PAGES */}
      {activePlatform === 'cloudflare' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Unlimited Bandwidth & DDoS Protection</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Deploy on Cloudflare Pages (Free Forever)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Unlimited bandwidth, 500 builds per month, and the world&apos;s fastest DNS and CDN network.
              </p>
            </div>
            <a
              href="https://dash.cloudflare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow"
            >
              <span>Cloudflare Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to the Cloudflare dashboard and click <strong>Workers &amp; Pages</strong> &rarr; <strong>Create application</strong> &rarr; <strong>Pages</strong>.</li>
              <li>Connect your Git repository.</li>
              <li>Configure build settings:
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg font-mono text-[11px] text-slate-800 dark:text-slate-200 my-1 space-y-0.5">
                  <div>Framework preset: <code>Vite</code></div>
                  <div>Build command: <code>npm run build</code></div>
                  <div>Build output directory: <code>dist</code></div>
                </div>
              </li>
              <li>Click <strong>Save and Deploy</strong>. Cloudflare Pages automatically publishes your site with free SSL and edge CDN caching!</li>
            </ol>
          </div>
        </div>
      )}

      {/* VERIFY PRODUCTION BUILD READY */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4 text-xs">
        <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Local Production Build Verification</span>
        </h3>
        <p className="text-slate-300 leading-relaxed">
          You can test and verify the exact production build locally on your machine at any time:
        </p>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1">
          <div className="text-slate-500"># 1. Compile the production bundles:</div>
          <div className="text-amber-400">$ npm run build</div>
          <div className="text-slate-500 pt-2"># 2. Preview the compiled production site locally:</div>
          <div className="text-amber-400">$ npm run preview</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="font-bold text-emerald-400 block">✓ Portable Paths</span>
            <span className="text-slate-400">Relative assets configured (<code className="text-slate-300">base: &apos;./&apos;</code>)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="font-bold text-emerald-400 block">✓ SPA Redirects</span>
            <span className="text-slate-400">Included <code className="text-slate-300">_redirects</code> &amp; <code className="text-slate-300">vercel.json</code></span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="font-bold text-emerald-400 block">✓ No Backend Needed</span>
            <span className="text-slate-400">Client-authoritative storage &amp; PDF generation</span>
          </div>
        </div>
      </div>

    </div>
  );
};
