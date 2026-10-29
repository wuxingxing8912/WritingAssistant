import type { LengthOption, ModeId, WritingMode } from '../types';
import {
  buildContinuePrompt,
  buildCopywritingPrompt,
  buildEmailPrompt,
  buildExpandPrompt,
  buildRewritePrompt,
  buildSummarizePrompt,
} from '../promptTemplates';

/** 六种写作模式（PRD 核心功能 2），提示词模板来自 prompts.md */
export const MODES: WritingMode[] = [
  {
    id: 'continue',
    label: '文章续写',
    icon: 'pen',
    hint: '延续原文风格与脉络继续创作',
    placeholder: '粘贴已写好的段落，AI 将顺着你的思路继续写下去……\n\n例如：\n夜色降临，老街的灯笼一盏盏亮了起来，',
    systemPrompt:
      '你是一位资深中文写作者。请延续用户给出的文本，保持原有的人称、语气、节奏与叙事风格，内容连贯自然，避免重复已写过的句子。',
    buildPrompt: buildContinuePrompt,
    sample:
      '灯笼的光晕在青石板上铺开一层暖色，把行人的影子拉得很长。街角的糖画摊还没收，老人握着铜勺，手腕一转便在石板上画出一条腾空的龙。\n\n我放慢脚步，听见过往的自行车铃在巷口清脆地响了一声，随后被更深的夜色吞没。这样的夜晚并不喧闹，却让人愿意一直走下去——仿佛只要再往前一步，就能听见这座城市更久远的心跳。',
  },
  {
    id: 'rewrite',
    label: '内容改写',
    icon: 'refresh',
    hint: '润色语句，使其更流畅、专业',
    placeholder: '输入需要改写的句子或段落，AI 会优化表达、消除口语化与冗余……',
    systemPrompt:
      '你是一位中文文字编辑。请改写用户给出的内容，使其更加流畅、专业、得体，保留原意与关键信息，修正语病与冗余表达。',
    buildPrompt: buildRewritePrompt,
    sample:
      '本次迭代的核心目标在于提升系统的整体响应性能。我们针对数据查询链路进行了重构，将平均响应时长降低了约 40%，同时显著改善了高并发场景下的稳定性表现。\n\n后续阶段，团队将持续完善监控告警机制，确保线上问题能够被及时发现与定位。',
  },
  {
    id: 'expand',
    label: '内容扩展',
    icon: 'expand',
    hint: '补充细节、案例与论据，写得更充分',
    placeholder: '输入一段要点或短文，AI 会扩写成内容充实的长文……',
    systemPrompt:
      '你是一位擅长展开论述的中文作者。请扩写用户给出的内容，补充具体细节、案例、数据与论证过程，使内容更充实有说服力，但不要偏离主题。',
    buildPrompt: buildExpandPrompt,
    sample:
      '远程办公之所以能在短时间内被广泛接受，首先得益于协作工具的成熟。文档实时协同、任务看板与视频会议的组合，让信息传递的延迟从“天”缩短到“秒”。\n\n其次，它改变了衡量产出的方式。管理者不再以工位上的时长作为标准，而是转向以交付物与里程碑为核心的结果导向评估。\n\n当然，远程办公也并非没有代价。团队默契的建立、新人的融入、非正式沟通的缺失，都是需要额外设计机制去弥补的部分。',
  },
  {
    id: 'summarize',
    label: '内容总结',
    icon: 'list',
    hint: '提炼核心要点，输出结构化摘要',
    placeholder: '粘贴长文，AI 会提取核心要点并整理成清晰摘要……',
    systemPrompt:
      '你是一位擅长信息提炼的编辑。请总结用户给出的内容，提取核心要点，使用条目化的结构呈现，语言精炼，不引入原文之外的新信息。',
    buildPrompt: buildSummarizePrompt,
    sample:
      '核心要点：\n\n1. 产品本季度增长主要来自老用户复购，占比达 62%，说明留存策略已见成效。\n2. 新客获取成本同比上升 18%，渠道投放效率出现下滑，需要重新评估预算分配。\n3. 客户反馈集中在交付周期与售后响应两个环节，是下阶段的优先改进方向。\n\n结论：短期应聚焦提升交付效率与售后体验，在稳住复购的同时控制获客成本。',
  },
  {
    id: 'email',
    label: '邮件撰写',
    icon: 'mail',
    hint: '按主题与语气生成一封完整邮件',
    placeholder: '描述邮件主题、收件人与你希望传达的内容，例如：\n给客户的正式邮件，说明项目延期一周并致歉，同时给出新的交付时间',
    systemPrompt:
      '你是一位商务沟通专家。请根据用户的描述撰写一封结构完整、语气得体的中文邮件，包含主题行、称呼、正文、落款，信息表达清晰有礼。',
    buildPrompt: buildEmailPrompt,
    sample:
      '主题：关于项目交付时间调整的沟通\n\n尊敬的李经理：\n\n您好！\n\n就本月合作协议中的交付安排，我们需向您说明一处调整。由于第三方数据接口的联调进度晚于预期，为确保交付质量，原定于 12 日的版本将顺延至 19 日提交。\n\n我们已增派两名工程师跟进联调，并会在 15 日前向您同步一次阶段性进展。由此给您带来的不便，我们深表歉意。\n\n如有任何疑问，欢迎随时与我联系。\n\n顺祝商祺\n\n王磊　|　项目经理',
  },
  {
    id: 'copywriting',
    label: '文案生成',
    icon: 'megaphone',
    hint: '为产品撰写有吸引力的营销文案',
    placeholder: '描述产品与风格，例如：\n为一款便携式咖啡机写一段年轻、有活力的社交媒体文案',
    systemPrompt:
      '你是一位资深营销文案策划。请根据用户的产品与风格要求，撰写富有吸引力、节奏感强、能激发购买欲的中文文案，突出卖点与用户利益。',
    buildPrompt: buildCopywritingPrompt,
    sample:
      '把咖啡馆装进口袋。\n\n30 秒冷萃，60℃ 恒温，一杯好咖啡不需要等。\n\n通勤路上、露营山间、加班深夜——它只有一台手机大小，却能在任何地方给你一份稳定的清醒。\n\n现在下单，附赠 12 支风味挂耳。今天，让好咖啡跟着你走。',
  },
];

export const DEFAULT_MODE_ID: ModeId = 'continue';

export function getMode(id: ModeId): WritingMode {
  return MODES.find((mode) => mode.id === id) ?? MODES[0];
}

/** 输出长度（PRD 核心功能 3） */
export const LENGTH_OPTIONS: LengthOption[] = [
  { label: '简短', value: 512, description: '要点式，约 300 字' },
  { label: '适中', value: 1024, description: '常规篇幅，约 600 字' },
  { label: '详细', value: 2048, description: '充分展开，约 1200 字' },
];
