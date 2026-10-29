import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** 各元素的 Tailwind 样式（未使用 typography 插件，逐元素映射样式） */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 border-b border-slate-200 pb-2 text-xl font-bold text-slate-900 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-lg font-bold text-slate-900 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-base font-semibold text-slate-900 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 whitespace-pre-wrap break-words leading-8 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1.5 pl-6 last:mb-0">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-6 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7 marker:text-indigo-400">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-lg border-l-4 border-indigo-300 bg-indigo-50/60 px-4 py-2 text-slate-600">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-100 scrollbar-slim">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-600">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-500"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 scrollbar-slim">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-600">{children}</td>
  ),
  img: ({ src, alt }) => (
    <img src={src} alt={alt} className="my-4 max-w-full rounded-xl border border-slate-200" />
  ),
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
  del: ({ children }) => <del className="text-slate-400">{children}</del>,
};

interface MarkdownProps {
  content: string;
}

/** 渲染模型输出的 Markdown（支持 GFM 表格、删除线等；默认不解析裸 HTML，安全） */
export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="text-[15px] text-slate-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
