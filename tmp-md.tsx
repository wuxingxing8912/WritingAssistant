import { renderToStaticMarkup } from 'react-dom/server';
import { Markdown } from './src/components/Markdown';

const sample = [
  '# 季度总结',
  '',
  '**核心结论**：复购率提升至 `62%`。',
  '',
  '1. 老用户复购占比 62%',
  '2. 新客获取成本上升 18%',
  '',
  '> 建议：优先优化交付效率。',
  '',
  '| 指标 | 环比 |',
  '| --- | --- |',
  '| 复购率 | +12% |',
  '',
  '```ts',
  'const rate = 0.62;',
  '```',
  '',
  '- [x] 完成复盘',
  '- [ ] 制定下季度计划',
].join('\n');

console.log(renderToStaticMarkup(<Markdown content={sample} />));
