import Comment from '@/components/Comment'
import ArticleLock from '@/components/ArticleLock'
import LazyImage from '@/components/LazyImage'
import NotionPage from '@/components/NotionPage'
import ShareBar from '@/components/ShareBar'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'
import { useRouter } from 'next/router'
import { Moon, Sun } from '@/components/HeroIcons'
import CONFIG from './config'

const c = key => siteConfig(key, CONFIG[key], CONFIG)
const list = key =>
  String(c(key) || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
const siteName = () =>
  c('OPC_NAME') || siteConfig('TITLE') || siteConfig('AUTHOR') || '个人主页'
const pageTitle = () =>
  c('OPC_TITLE') || siteConfig('AUTHOR') || siteConfig('TITLE') || '个人主页'

const isExternal = href => typeof href === 'string' && /^https?:\/\//.test(href)

/** 阶段定义：pipeline 轨与方法说明共用，避免重复叙述 */
const PIPELINE = [
  {
    step: '01',
    name: '立项',
    meta: 'ready',
    detail: '只选一个最小可验证目标，写清边界和验收口径。'
  },
  {
    step: '02',
    name: '拆单',
    meta: 'running',
    detail: '任务落成文件，指定产物路径和依赖顺序。'
  },
  {
    step: '03',
    name: '执行',
    meta: 'running',
    detail: '先接入成熟方案，再复制成熟做法，最后才自研。'
  },
  {
    step: '04',
    name: '验收',
    meta: 'review',
    detail: '按标准验收，不合格就带着问题重开一轮。'
  }
]

/** 业务方向：阶段决定点的填充方式，不用额外装饰色 */
const DIRECTION_STAGES = {
  游戏: 'running',
  小说: 'running',
  短剧: 'review',
  工具产品: 'done',
  流量媒体: 'running',
  AI企业工作流: 'running',
  量化交易: 'review'
}

const DIRECTION_DETAILS = {
  游戏: '玩法原型 · 实验中',
  小说: '世界观与连载 · 持续记录',
  短剧: '脚本与分镜 · 原型中',
  工具产品: '独立产品 · 打磨中',
  流量媒体: '获客渠道 · 自动搭建',
  AI企业工作流: '组织协作 · 自动运行',
  量化交易: '策略观察 · 长期研究'
}

const parseDirection = value => {
  const [name, requestedStage, ...details] = value
    .split('|')
    .map(part => part.trim())
  const stage = ['ready', 'running', 'review', 'done'].includes(requestedStage)
    ? requestedStage
    : DIRECTION_STAGES[name] || 'ready'

  return {
    name,
    stage,
    detail: details.join('|') || DIRECTION_DETAILS[name] || '持续实验和迭代'
  }
}

const getPostHref = post => post?.href || (post?.slug ? `/${post.slug}` : '#')

/* ------------------------------------------------------------------ *
 * 基础件
 * ------------------------------------------------------------------ */

const ActionLink = ({ href, children, primary, className = '' }) => (
  <SmartLink
    href={href}
    target={isExternal(href) ? '_blank' : undefined}
    rel={isExternal(href) ? 'noreferrer' : undefined}
    className={`opc-action inline-flex min-h-[46px] items-center justify-center gap-2 px-5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
      primary ? 'opc-primary-action' : 'opc-secondary-action'
    } ${className}`}
  >
    {children}
  </SmartLink>
)

/** 阶段标签：唯一 accent 的不同浓度，形状区分状态而非新增颜色 */
const StageTag = ({ stage, children }) => (
  <span className={`opc-stage opc-stage-${stage || 'ready'}`}>
    <span className='opc-stage-dot' aria-hidden='true' />
    {children}
  </span>
)

const SectionHead = ({ index, title, description, action }) => (
  <div className='opc-section-head'>
    <div className='min-w-0'>
      <div className='opc-eyebrow'>{index}</div>
      <h2 className='mt-3 text-2xl font-semibold tracking-tight sm:text-3xl'>
        {title}
      </h2>
      {description && (
        <p className='opc-muted mt-3 max-w-2xl text-sm leading-7'>
          {description}
        </p>
      )}
    </div>
    {action && <div className='opc-section-action'>{action}</div>}
  </div>
)

/* ------------------------------------------------------------------ *
 * 顶栏
 * ------------------------------------------------------------------ */

const OpcDarkModeButton = ({ compact = false }) => {
  const { isDarkMode, toggleDarkMode } = useGlobal()

  return (
    <button
      type='button'
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Light mode' : 'Dark mode'}
      className={`opc-icon-button inline-flex items-center justify-center border transition ${
        compact ? 'h-9 w-9' : 'h-10 w-10'
      }`}
    >
      <span className='h-[18px] w-[18px]'>
        {isDarkMode ? <Sun /> : <Moon />}
      </span>
    </button>
  )
}

const SiteHeader = () => {
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  return (
    <header className='opc-header sticky top-0 z-30'>
      <div className='mx-auto flex max-w-[80rem] items-center gap-4 px-5 py-4 md:px-8'>
        <SmartLink href='/' className='opc-brand'>
          <span className='opc-brand-mark' aria-hidden='true'>
            <img src='/bot-icon.jpg' alt='' />
          </span>
          <span className='whitespace-nowrap text-sm font-semibold tracking-[0.12em]'>
            {siteName()}
          </span>
        </SmartLink>

        <nav className='ml-2 hidden items-center gap-5 text-sm md:flex'>
          {[
            ['pipeline', '流水线'],
            ['directions', '方向'],
            ['records', '记录']
          ].map(([id, label]) => (
            <a
              key={id}
              href={`${isHomePage ? '' : '/'}#${id}`}
              className='opc-nav-link'
            >
              {label}
            </a>
          ))}
        </nav>

        <div className='ml-auto flex items-center gap-3'>
          <StageTag stage='running'>{c('OPC_STATUS_TEXT')}</StageTag>
          <OpcDarkModeButton compact />
        </div>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ *
 * 首屏
 * ------------------------------------------------------------------ */

const OFFER_HREF = '/article/ai-model-offer'
const OFFER_TITLE = '提供 ai大模型处理方案'
const OFFER_HOME_TITLE = 'AI大模型处理方案'
const OFFER_LINES = [
  {
    src: '/offer/path.jpg',
    text: '从货源到平台到开发者，一站式解决开发者无法使用国外一流 ai 大模型的问题。'
  },
  {
    src: '/offer/steady.jpg',
    text: '稳定维护服务，不宕机，增加工作效率，增加工作能力，几何级别的提升。'
  },
  {
    src: '/offer/phone.jpg',
    text: '告别传统程序员码代码的低效率，解放开发者的脑力劳动。同样提供开发者远程 ai 开发功能，让开发者能够随时随地用手机远程电脑大模型来保证产出。'
  },
  {
    src: '/offer/tables.jpg',
    text: '目前已经为五百强上市企业，国内知名企业，中小型企业，小工作室完成业务交付，以及稳定维护。'
  }
]

const OfferDeck = () => (
  <article id='article-wrapper' className='opc-deck'>
    <section className='opc-slide'>
      <div className='opc-slide-copy'>
        <SmartLink href='/#records' className='opc-deck-back'>
          ← 返回长期记录
        </SmartLink>
        <h1>{OFFER_TITLE}</h1>
        <p>{OFFER_LINES[0].text}</p>
      </div>
      <div className='opc-slide-media'>
        <LazyImage
          priority
          src={OFFER_LINES[0].src}
          alt={OFFER_LINES[0].text}
          className='h-full w-full object-cover'
        />
      </div>
    </section>

    <section className='opc-slide opc-slide-flip'>
      <div className='opc-slide-copy'>
        <span className='opc-slide-index'>02</span>
        <h2>稳定维护服务，不宕机</h2>
        <p>增加工作效率，增加工作能力，几何级别的提升。</p>
      </div>
      <div className='opc-slide-media'>
        <LazyImage
          src={OFFER_LINES[1].src}
          alt={OFFER_LINES[1].text}
          className='h-full w-full object-cover'
        />
      </div>
    </section>

    <section className='opc-slide'>
      <div className='opc-slide-copy'>
        <span className='opc-slide-index'>03</span>
        <h2>告别传统程序员码代码的低效率，解放开发者的脑力劳动。</h2>
        <p>
          同样提供开发者远程 ai
          开发功能，让开发者能够随时随地用手机远程电脑大模型来保证产出。
        </p>
      </div>
      <div className='opc-slide-media'>
        <LazyImage
          src={OFFER_LINES[2].src}
          alt={OFFER_LINES[2].text}
          className='h-full w-full object-cover'
        />
      </div>
    </section>

    <section className='opc-slide opc-slide-board'>
      <div className='opc-slide-copy'>
        <span className='opc-slide-index'>04</span>
        <p>{OFFER_LINES[3].text}</p>
        <ul className='opc-slide-names'>
          <li>五百强上市企业</li>
          <li>国内知名企业</li>
          <li>中小型企业</li>
          <li>小工作室</li>
        </ul>
      </div>
      <div className='opc-slide-media'>
        <LazyImage
          src={OFFER_LINES[3].src}
          alt={OFFER_LINES[3].text}
          className='h-full w-full object-cover'
        />
      </div>
    </section>
  </article>
)

const TaskTicket = () => (
  <aside className='opc-ticket'>
    <SmartLink href={OFFER_HREF} className='opc-offer-shot'>
      <LazyImage
        priority
        src={OFFER_LINES[0].src}
        alt={OFFER_HOME_TITLE}
        className='h-full w-full object-cover'
      />
    </SmartLink>
    <div className='opc-offer-copy'>
      <SmartLink href={OFFER_HREF} className='opc-offer-title'>
        {OFFER_HOME_TITLE}
      </SmartLink>
      <p>{OFFER_LINES[3].text}</p>
    </div>
  </aside>
)

const PipelineRail = () => (
  <div className='opc-rail'>
    {PIPELINE.map((item, index) => (
      <div key={item.step} className='opc-rail-item'>
        <div className='opc-rail-head'>
          <span className='opc-rail-step'>{item.step}</span>
          <StageTag stage={item.meta}>{item.meta}</StageTag>
        </div>
        <div className='mt-3 text-sm font-semibold'>{item.name}</div>
        <p className='opc-muted mt-2 text-sm leading-6'>{item.detail}</p>
        {index < PIPELINE.length - 1 && (
          <span className='opc-rail-link' aria-hidden='true' />
        )}
      </div>
    ))}
  </div>
)

const HeroSection = () => (
  <div className='opc-hero-band'>
    <section className='opc-hero'>
      <div className='opc-hero-grid'>
        <div className='opc-hero-copy'>
          <div className='opc-eyebrow'>{c('OPC_KICKER')}</div>
          <h1 className='opc-display mt-6'>{pageTitle()}</h1>
          <div className='opc-subtitle mt-5'>{c('OPC_SUBTITLE')}</div>
          <p className='opc-muted mt-6 max-w-xl text-base leading-8'>
            {c('OPC_DESCRIPTION')}
          </p>
          <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
            <ActionLink href={c('OPC_PRIMARY_URL')} primary>
              {c('OPC_PRIMARY_TEXT')}
            </ActionLink>
            <ActionLink href={c('OPC_SECONDARY_URL')}>
              {c('OPC_SECONDARY_TEXT')}
            </ActionLink>
          </div>
        </div>

        <TaskTicket />
      </div>

      <div id='pipeline' className='opc-hero-rail'>
        <PipelineRail />
      </div>
    </section>
  </div>
)

/* ------------------------------------------------------------------ *
 * 首页各段
 * ------------------------------------------------------------------ */

const StatStrip = ({ runningCount, directionCount }) => {
  const stats = [
    { label: '流水线阶段', value: PIPELINE.length, unit: '步' },
    { label: '在跑方向', value: runningCount, unit: `/ ${directionCount}` }
  ]

  return (
    <div className='opc-stats'>
      {stats.map(item => (
        <div key={item.label} className='opc-stat'>
          <div className='opc-stat-value'>
            {item.value}
            <span className='opc-stat-unit'>{item.unit}</span>
          </div>
          <div className='opc-muted mt-1 text-xs'>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

const DirectionsPanel = () => {
  const items = list('OPC_NOW_ITEMS').map(parseDirection)
  const running = items.filter(item => item.stage === 'running').length

  return (
    <section id='directions' className='opc-block'>
      <SectionHead
        index='01 / 方向'
        title={c('OPC_NOW_TITLE')}
        description={c('OPC_NOW_DESCRIPTION')}
        action={
          <StatStrip directionCount={items.length} runningCount={running} />
        }
      />
      <ul className='opc-list'>
        {items.map(item => (
          <li key={item.name} className='opc-list-row'>
            <span className='opc-list-name'>{item.name}</span>
            <span className='opc-muted opc-list-detail'>{item.detail}</span>
            <StageTag stage={item.stage}>{item.stage}</StageTag>
          </li>
        ))}
      </ul>
    </section>
  )
}

const MethodPanel = () => (
  <section className='opc-block'>
    <SectionHead
      index='02 / 方法'
      title={c('OPC_METHOD_TITLE')}
      description={c('OPC_METHOD_DESCRIPTION')}
    />
    <div className='opc-method-grid'>
      {['一轮一任务', '文档先交接', '产物可验收', '失败可返工'].map(
        (item, index) => (
          <div key={item} className='opc-method-card'>
            <span className='opc-rail-step'>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className='mt-4 text-sm font-semibold'>{item}</div>
          </div>
        )
      )}
    </div>
  </section>
)

const PostCard = ({ post }) => {
  const cover = post?.pageCoverThumbnail || post?.pageCover

  return (
    <SmartLink
      href={getPostHref(post)}
      className={`opc-record group block transition ${
        cover ? 'md:flex md:items-center md:gap-6' : ''
      }`}
    >
      {cover && (
        <LazyImage
          src={cover}
          alt={`${post?.title || '文章'} 封面`}
          className='mb-4 h-56 w-full rounded-md object-cover sm:h-64 md:mb-0 md:h-48 md:w-[35%] md:max-w-[360px] md:min-w-[260px]'
        />
      )}
      <div className={`min-w-0 flex-1 ${cover ? 'md:py-4 md:pr-3' : ''}`}>
        <div className='flex items-baseline justify-between gap-4'>
          <div className='flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1'>
            <span className='opc-muted text-xs tabular-nums'>
              {post?.publishDay || post?.lastEditedDay || '长期记录'}
            </span>
            <h3
              className={`font-semibold ${
                cover ? 'text-lg md:text-xl' : 'text-base'
              }`}
            >
              {post?.title}
            </h3>
          </div>
          {cover && (
            <span
              aria-hidden='true'
              className='opc-record-arrow opc-muted shrink-0 text-lg transition'
            >
              ↗
            </span>
          )}
        </div>
        {post?.summary && (
          <p
            className={`opc-muted mt-2 line-clamp-2 text-sm leading-6 ${
              cover ? 'max-w-2xl' : ''
            }`}
          >
            {post.summary}
          </p>
        )}
      </div>
    </SmartLink>
  )
}

const RECORDS_PREVIEW = 4

const RecordsPanel = ({ posts, postCount }) => {
  const list = (posts || []).slice(0, RECORDS_PREVIEW)
  const totalPosts = postCount ?? posts?.length ?? 0

  return (
    <section id='records' className='opc-block'>
      <SectionHead
        index='03 / 记录'
        title={c('OPC_RECORDS_TITLE')}
        description={c('OPC_RECORDS_DESCRIPTION')}
        action={
          totalPosts > 0 && (
            <ActionLink href='/archive' className='shrink-0'>
              查看全部 {totalPosts} 篇
            </ActionLink>
          )
        }
      />
      <div className='opc-records'>
        {list.length > 0 ? (
          list.map(post => (
            <PostCard key={post.id || post.slug || post.title} post={post} />
          ))
        ) : (
          <EmptyState title='还没有公开记录' />
        )}
      </div>
    </section>
  )
}

const EmptyState = ({ title = '暂无内容' }) => (
  <div className='opc-muted rounded-md border border-dashed p-8 text-center text-sm'>
    {title}
  </div>
)

/* ------------------------------------------------------------------ *
 * 页脚
 * ------------------------------------------------------------------ */

const OpcFooter = () => (
  <footer className='opc-footer px-5 pb-10 md:px-8'>
    <div className='opc-footer-inner'>
      <div className='opc-muted'>
        由{' '}
        <SmartLink href='https://notionnext.tangly1024.com/'>
          NotionNext
        </SmartLink>{' '}
        开发 · 主题 OPC
      </div>
      <div className='flex flex-wrap gap-4'>
        <SmartLink href='https://notionnext.tangly1024.com/user-guide/start-here'>
          NotionNext 帮助
        </SmartLink>
        <SmartLink href='https://notionnext.tangly1024.com/user-guide/themes/opc'>
          OPC 主题文档
        </SmartLink>
      </div>
    </div>
  </footer>
)

/* ------------------------------------------------------------------ *
 * 样式
 * ------------------------------------------------------------------ */

const Style = () => (
  <style jsx global>{`
    ${themeConsoleStyle('opc', CONFIG)}

    #theme-opc {
      --opc-accent-soft: color-mix(
        in srgb,
        var(--opc-console-primary) 10%,
        transparent
      );
      --opc-accent-line: color-mix(
        in srgb,
        var(--opc-console-primary) 34%,
        transparent
      );
      /* 分隔线与网格纹是两个强度等级，避免线条压在文字下 */
      --opc-hairline: color-mix(
        in srgb,
        var(--opc-console-text) 14%,
        transparent
      );
      --opc-grid: color-mix(in srgb, var(--opc-console-text) 5%, transparent);
      --opc-gutter: clamp(1.25rem, 5vw, 2rem);
      background: var(--opc-console-bg);
      color: var(--opc-console-text);
    }

    /* 网格纹理只出现在首屏，并向下淡出；色带是自然满幅的容器，不依赖 100vw */
    #theme-opc .opc-hero-band {
      position: relative;
      isolation: isolate;
    }

    #theme-opc .opc-hero-band::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background:
        radial-gradient(
          circle at 22% 0%,
          var(--opc-accent-soft) 0,
          transparent 58%
        ),
        linear-gradient(90deg, var(--opc-grid) 1px, transparent 1px),
        linear-gradient(var(--opc-grid) 1px, transparent 1px);
      background-size:
        auto,
        104px 104px,
        104px 104px;
      -webkit-mask-image: linear-gradient(
        to bottom,
        #000 0,
        #000 52%,
        transparent 97%
      );
      mask-image: linear-gradient(to bottom, #000 0, #000 52%, transparent 97%);
    }

    .dark #theme-opc .opc-hero-band::before {
      background:
        radial-gradient(
          circle at 22% 0%,
          color-mix(in srgb, var(--opc-console-primary) 14%, transparent) 0,
          transparent 60%
        ),
        linear-gradient(90deg, var(--opc-grid) 1px, transparent 1px),
        linear-gradient(var(--opc-grid) 1px, transparent 1px);
    }

    #theme-opc .opc-muted {
      color: var(--opc-console-text-secondary);
    }

    /* 顶栏 */
    #theme-opc .opc-header {
      background: color-mix(in srgb, var(--opc-console-bg) 82%, transparent);
      backdrop-filter: saturate(150%) blur(14px);
      border-bottom: 1px solid var(--opc-hairline);
    }

    #theme-opc .opc-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
    }

    #theme-opc .opc-brand-mark {
      display: inline-flex;
      height: 2rem;
      width: 2rem;
      overflow: hidden;
      align-items: center;
      justify-content: center;
      border-radius: 0.45rem;
      background: #fff;
    }

    #theme-opc .opc-brand-mark img {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }

    #theme-opc .opc-nav-link {
      color: var(--opc-console-text-secondary);
      transition: color 0.18s ease;
    }

    #theme-opc .opc-nav-link:hover {
      color: var(--opc-console-primary);
    }

    #theme-opc .opc-icon-button {
      border-color: var(--opc-hairline);
      color: var(--opc-console-text-secondary);
    }

    #theme-opc .opc-icon-button:hover {
      border-color: var(--opc-console-primary);
      color: var(--opc-console-primary);
    }

    /* 通用小标签 */
    #theme-opc .opc-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--opc-console-primary);
    }

    #theme-opc .opc-eyebrow::before {
      content: '';
      height: 0.4rem;
      width: 0.4rem;
      background: var(--opc-console-primary);
    }

    #theme-opc .opc-stage {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid var(--opc-accent-line);
      border-radius: 0.25rem;
      padding: 0.15rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      white-space: nowrap;
      color: var(--opc-console-primary);
    }

    #theme-opc .opc-stage-dot {
      height: 0.35rem;
      width: 0.35rem;
      border-radius: 9999px;
      background: currentColor;
    }

    #theme-opc .opc-stage-ready .opc-stage-dot,
    #theme-opc .opc-stage-review .opc-stage-dot {
      background: transparent;
      box-shadow: inset 0 0 0 1px currentColor;
    }

    #theme-opc .opc-stage-done {
      color: var(--opc-console-text-secondary);
      border-color: var(--opc-hairline);
    }

    #theme-opc .opc-stage-done .opc-stage-dot {
      background: currentColor;
    }

    /* 按钮 */
    #theme-opc .opc-primary-action {
      background: var(--opc-console-primary);
      color: var(--opc-console-bg);
      box-shadow: 0 14px 34px
        color-mix(in srgb, var(--opc-console-primary) 22%, transparent);
    }

    #theme-opc .opc-primary-action:hover {
      background: color-mix(
        in srgb,
        var(--opc-console-primary) 88%,
        var(--opc-console-text)
      );
    }

    #theme-opc .opc-secondary-action {
      border: 1px solid var(--opc-hairline);
      color: var(--opc-console-text);
    }

    #theme-opc .opc-secondary-action:hover {
      border-color: var(--opc-console-primary);
      color: var(--opc-console-primary);
    }

    /* 首屏 */
    #theme-opc .opc-hero {
      margin: 0 auto;
      max-width: 80rem;
      padding: clamp(2.5rem, 7vw, 5rem) var(--opc-gutter) 0;
    }

    #theme-opc .opc-hero-grid {
      display: grid;
      gap: clamp(2.5rem, 5vw, 4rem);
      align-items: center;
    }

    @media (min-width: 1024px) {
      #theme-opc .opc-hero-grid {
        grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
        align-items: start;
      }
    }

    #theme-opc .opc-offer-shot {
      display: block;
      aspect-ratio: 16 / 10;
      overflow: hidden;
    }

    #theme-opc .opc-offer-shot img,
    #theme-opc .opc-offer-figure img {
      outline: 1px solid oklch(0 0 0 / 0.1);
      outline-offset: -1px;
    }

    .dark #theme-opc .opc-offer-shot img,
    .dark #theme-opc .opc-offer-figure img {
      outline-color: oklch(1 0 0 / 0.1);
    }

    #theme-opc .opc-offer-copy {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      padding: 1.15rem 1.25rem 1.3rem;
    }

    #theme-opc .opc-offer-title {
      font-size: clamp(1.85rem, 3.2vw, 2.45rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.15;
      text-wrap: balance;
    }

    #theme-opc .opc-offer-copy p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.7;
      text-wrap: pretty;
    }

    #theme-opc .opc-offer-heading {
      margin: 1.35rem 0 0;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.2;
      text-wrap: balance;
    }

    #theme-opc .opc-offer-block {
      margin-top: 1.75rem;
    }

    #theme-opc .opc-offer-figure {
      margin: 0;
      overflow: hidden;
      border-radius: 0.75rem;
      aspect-ratio: 16 / 9;
      background: color-mix(
        in srgb,
        var(--opc-console-border) 40%,
        transparent
      );
    }

    #theme-opc .opc-offer-lead,
    #theme-opc .opc-offer-block p {
      margin: 0.9rem 0 0;
      font-size: 1.0625rem;
      line-height: 1.85;
      text-wrap: pretty;
    }

    html:has(.opc-deck) {
      scroll-snap-type: y proximity;
    }

    #theme-opc .opc-deck {
      background: #0a0a0a;
      color: #ece8e1;
    }

    #theme-opc .opc-slide {
      display: grid;
      min-height: calc(100svh - 4.5rem);
      scroll-snap-align: start;
      scroll-margin-top: 4.5rem;
    }

    #theme-opc .opc-slide-copy {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1.15rem;
      padding: clamp(1.5rem, 4vw, 3.25rem);
    }

    #theme-opc .opc-deck-back {
      color: #a8a49b;
      font-size: 0.875rem;
    }

    #theme-opc .opc-slide-index {
      color: #6b6760;
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.14em;
    }

    #theme-opc .opc-slide h1,
    #theme-opc .opc-slide h2 {
      margin: 0;
      max-width: 16em;
      color: #ece8e1;
      font-size: clamp(1.85rem, 3.6vw, 2.85rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.25;
      text-wrap: balance;
    }

    #theme-opc .opc-slide p {
      margin: 0;
      max-width: 36rem;
      color: #a8a49b;
      font-size: clamp(1rem, 1.5vw, 1.2rem);
      line-height: 1.75;
      text-wrap: pretty;
    }

    #theme-opc .opc-slide-media {
      position: relative;
      min-height: 42vh;
    }

    #theme-opc .opc-slide-media img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    #theme-opc .opc-slide-names {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem 1.25rem;
      margin: 0.4rem 0 0;
      padding: 0;
      list-style: none;
    }

    #theme-opc .opc-slide-names li {
      margin: 0;
      border-top: 1px solid #2a2a28;
      padding-top: 0.75rem;
      color: #ece8e1;
      font-size: clamp(1.05rem, 2vw, 1.4rem);
      font-weight: 600;
      line-height: 1.35;
    }

    @media (min-width: 900px) {
      #theme-opc .opc-slide {
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      }

      #theme-opc .opc-slide-flip .opc-slide-media {
        order: 2;
      }

      #theme-opc .opc-slide-board {
        grid-template-columns: 1fr;
      }

      #theme-opc .opc-slide-board .opc-slide-media {
        min-height: 38vh;
        order: 0;
      }

      #theme-opc .opc-slide-names {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    #theme-opc .opc-display {
      font-size: clamp(2.75rem, 8vw, 5rem);
      font-weight: 600;
      line-height: 1.02;
      letter-spacing: -0.03em;
    }

    #theme-opc .opc-subtitle {
      font-size: clamp(1.15rem, 2.4vw, 1.5rem);
      font-weight: 600;
      line-height: 1.4;
    }

    /* 任务单卡片 */
    #theme-opc .opc-ticket {
      border: 1px solid var(--opc-hairline);
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--opc-console-card) 88%, transparent);
      box-shadow: 0 28px 70px
        color-mix(in srgb, var(--opc-console-text) 8%, transparent);
      overflow: hidden;
    }

    #theme-opc .opc-ticket-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-bottom: 1px dashed var(--opc-hairline);
      padding: 0.75rem 1.25rem;
    }

    #theme-opc .opc-ticket-tab {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--opc-console-text-secondary);
    }

    #theme-opc .opc-ticket-cover {
      aspect-ratio: 16 / 7;
      /* 单列布局下封面不能随宽度无限长高，否则会盖过文字 */
      max-height: 14rem;
      background: color-mix(
        in srgb,
        var(--opc-console-border) 40%,
        transparent
      );
    }

    #theme-opc .opc-ticket-rows > div {
      display: grid;
      grid-template-columns: 3.25rem minmax(0, 1fr);
      gap: 0.75rem;
      border-top: 1px solid var(--opc-hairline);
      padding: 0.9rem 1.25rem;
    }

    #theme-opc .opc-ticket-rows dt {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--opc-console-primary);
    }

    #theme-opc .opc-ticket-rows dd {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.6;
    }

    /* 流水线轨 */
    #theme-opc .opc-hero-rail {
      margin-top: clamp(2.5rem, 5vw, 4rem);
      border-top: 1px solid var(--opc-hairline);
      padding-top: 1.75rem;
    }

    #theme-opc .opc-rail {
      display: grid;
      gap: 1.25rem;
    }

    @media (min-width: 640px) {
      #theme-opc .opc-rail {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      #theme-opc .opc-rail {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    #theme-opc .opc-rail-item {
      position: relative;
      padding-left: 1rem;
      border-left: 2px solid var(--opc-accent-line);
    }

    #theme-opc .opc-rail-item:first-child {
      border-left-color: var(--opc-console-primary);
    }

    #theme-opc .opc-rail-head {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    #theme-opc .opc-rail-step {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--opc-console-primary);
      font-variant-numeric: tabular-nums;
    }

    #theme-opc .opc-rail-link {
      display: none;
    }

    @media (min-width: 1024px) {
      #theme-opc .opc-rail-link {
        display: block;
        position: absolute;
        top: 0.5rem;
        right: -0.65rem;
        height: 1px;
        width: 1.25rem;
        background: var(--opc-accent-line);
      }
    }

    /* 内容块 */
    #theme-opc .opc-block {
      margin: 0 auto;
      max-width: 80rem;
      padding: clamp(3rem, 7vw, 5rem) var(--opc-gutter) 0;
    }

    #theme-opc .opc-section-head {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      border-bottom: 1px solid var(--opc-hairline);
      padding-bottom: 1.75rem;
    }

    #theme-opc #records .opc-section-head {
      border-bottom: 0;
    }

    @media (min-width: 768px) {
      #theme-opc .opc-section-head {
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
      }
    }

    #theme-opc .opc-section-action {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: flex-end;
      flex-shrink: 0;
    }

    @media (min-width: 768px) {
      #theme-opc .opc-section-action {
        justify-content: flex-end;
      }
    }

    #theme-opc .opc-stats {
      display: flex;
      gap: 1.5rem;
      flex-shrink: 0;
    }

    #theme-opc .opc-stat-value {
      font-size: 1.75rem;
      font-weight: 600;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }

    #theme-opc .opc-stat-unit {
      margin-left: 0.15rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--opc-console-text-secondary);
    }

    /* 方向列表 */
    #theme-opc .opc-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    #theme-opc .opc-list-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0.35rem;
      align-items: center;
      border-bottom: 1px solid var(--opc-hairline);
      padding: 1rem 0;
    }

    @media (min-width: 768px) {
      #theme-opc .opc-list-row {
        grid-template-columns: minmax(0, 10rem) minmax(0, 1fr) auto;
        gap: 1.5rem;
      }
    }

    #theme-opc .opc-list-row:hover .opc-list-name {
      color: var(--opc-console-primary);
    }

    #theme-opc .opc-list-row .opc-stage {
      justify-self: start;
    }

    #theme-opc .opc-list-name {
      font-size: 0.95rem;
      font-weight: 600;
      transition: color 0.18s ease;
    }

    #theme-opc .opc-list-detail {
      font-size: 0.85rem;
    }

    /* 方法 */
    #theme-opc .opc-method-grid {
      display: grid;
      gap: 0.75rem;
      margin-top: 1.75rem;
    }

    @media (min-width: 640px) {
      #theme-opc .opc-method-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      #theme-opc .opc-method-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    #theme-opc .opc-method-card {
      border: 1px solid var(--opc-hairline);
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--opc-console-card) 60%, transparent);
      padding: 1.1rem 1.25rem;
      transition:
        border-color 0.18s ease,
        background-color 0.18s ease;
    }

    #theme-opc .opc-method-card:hover {
      border-color: var(--opc-accent-line);
      background: color-mix(
        in srgb,
        var(--opc-console-primary) 5%,
        var(--opc-console-card)
      );
    }

    /* 记录 */
    #theme-opc .opc-record,
    #theme-opc .opc-ticket-top,
    #theme-opc .opc-ticket > div {
      border-color: var(--opc-hairline);
    }

    #theme-opc .opc-record {
      border: 1px solid var(--opc-hairline);
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--opc-console-card) 72%, transparent);
      padding: 0.75rem;
    }

    #theme-opc .opc-record + .opc-record {
      margin-top: 1rem;
    }

    #theme-opc .opc-record:hover {
      border-color: var(--opc-accent-line);
      background: color-mix(
        in srgb,
        var(--opc-console-primary) 4%,
        var(--opc-console-card)
      );
    }

    #theme-opc .opc-record:hover h3 {
      color: var(--opc-console-primary);
    }

    #theme-opc .opc-record:hover .opc-record-arrow {
      transform: translate(2px, -2px);
    }

    #theme-opc .opc-record h3 {
      transition: color 0.18s ease;
    }

    /* 灵绘文章配图 */
    #theme-opc .opc-linghui-title {
      margin: 1.75rem 0 0;
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.15;
    }

    #theme-opc .opc-linghui {
      margin-bottom: 2.75rem;
    }

    #theme-opc .opc-linghui h2 {
      margin: 2.4rem 0 0;
      font-size: 1.35rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    #theme-opc .opc-linghui p,
    #theme-opc .opc-linghui blockquote {
      margin: 0.95rem 0 0;
      font-size: 1.0625rem;
      line-height: 1.85;
    }

    #theme-opc .opc-linghui blockquote {
      border-left: 2px solid var(--opc-hairline);
      padding-left: 1rem;
      color: var(--opc-console-text-secondary);
    }

    #theme-opc .opc-linghui-link {
      text-decoration: underline;
      text-underline-offset: 0.22em;
    }

    #theme-opc .opc-linghui-figure {
      margin: 1.35rem 0 0;
      overflow: hidden;
      border-radius: 0.75rem;
      aspect-ratio: 16 / 9;
      background: #0a0a0a;
    }

    #theme-opc .opc-linghui-figure img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* 文章页 */
    #theme-opc .opc-post-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      border-bottom: 1px solid var(--opc-hairline);
      padding-bottom: 1rem;
      font-size: 0.8125rem;
    }

    /* 页脚 */
    #theme-opc .opc-footer-inner {
      margin: 0 auto;
      max-width: 80rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border-top: 1px solid var(--opc-hairline);
      padding-top: 1.75rem;
      font-size: 0.75rem;
    }

    @media (min-width: 640px) {
      #theme-opc .opc-footer-inner {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    #theme-opc .opc-footer a {
      color: var(--opc-console-primary);
    }

    #theme-opc .opc-footer a:hover {
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    #theme-opc .notion {
      color: var(--opc-console-text);
    }
  `}</style>
)

/* ------------------------------------------------------------------ *
 * Layouts
 * ------------------------------------------------------------------ */

const LayoutBase = ({ children }) => (
  <div id='theme-opc' className={`${siteConfig('FONT_STYLE')} min-h-screen`}>
    <Style />
    <SiteHeader />
    {children}
    <OpcFooter />
  </div>
)

const LayoutIndex = props => {
  const posts = props?.posts || []

  return (
    <main>
      <HeroSection />
      <DirectionsPanel />
      <MethodPanel />
      <RecordsPanel posts={posts} postCount={props?.postCount} />
    </main>
  )
}

const LINGHUI_SITE = 'https://images.vcv.lv'

const LinghuiText = ({ text }) => {
  const parts = text.split(LINGHUI_SITE)
  if (parts.length === 1) return text
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 && (
        <a href={LINGHUI_SITE} className='opc-linghui-link'>
          {LINGHUI_SITE}
        </a>
      )}
    </span>
  ))
}

const LinghuiFigure = ({ src, alt, priority = false }) => (
  <figure className='opc-linghui-figure'>
    <LazyImage
      priority={priority}
      src={src}
      alt={alt}
      className='h-full w-full object-cover'
    />
  </figure>
)

const LinghuiEssay = () => (
  <div className='opc-linghui'>
    <p>
      <LinghuiText text='灵绘 AI 是自建的图像生成站点，线上地址是 https://images.vcv.lv。要处理的是三件事：国内怎么付款、不注册能不能先用、以及模型名称和上游文件信息能不能留在服务端。' />
    </p>
    <LinghuiFigure
      priority
      src='/linghui/studio.jpg'
      alt='暗色工作台上的显示器，屏幕里是一张没有文字的建筑照片'
    />
    <h2>要解决的问题</h2>
    <p>
      付款。常见的海外订阅在国内走不通。站点用支付宝当面付：预下单，页面出示二维码，到账通知先做 RSA2 验签，再核对应用和金额。同一笔通知会重复到达，积分只允许加一次。积分包有三档：入门包 9.90 元 / 200 积分，进阶包 49 元 / 1100 积分，工作室包 99 元 / 2400 积分。
    </p>
    <LinghuiFigure
      src='/linghui/pay.jpg'
      alt='暗色工作台上竖着一台手机，旁边是一块黑色终端'
    />
    <p>
      试用。不必先注册。第一次下单或生图，会在这台浏览器里建立一个游客账户，积分和作品先放在这里，绑定邮箱以后才留下来。注册账号赠送 15 积分。游客不赠送，避免空账号被刷。每个 IP 只能注册一个账号，保存的是加盐哈希，不保存原始 IP。
    </p>
    <p>
      出图。尺寸、张数和价格如果放在浏览器里计算，就可以被改掉。尺寸从 1K 到 4K，有九种比例，也可以自己填宽高。画质分为草稿、标准、高清、超清、极致。一次可出 1 到 4 张，格式为 PNG、JPEG、WebP 或 GIF。最多可附 4 张参考图。界面只显示极速版、精修版，实际调用的模型留在服务端。
    </p>
    <LinghuiFigure
      src='/linghui/prints.jpg'
      alt='暗色工作台上四张不同比例的成图'
    />
    <p>
      成图。上游文件会带上厂商的元数据。写入存储前去掉这些信息，再写入本站的 AI 生成标识。只改文件信息，像素不重新压缩。生成失败会把积分退回。
    </p>
    <h2>技术栈</h2>
    <p>
      <LinghuiText text='页面是 Next.js 16、React 19、TypeScript 和 Tailwind CSS 4，用 OpenNext 部署到 Cloudflare Workers。账号、订单、积分流水和生成记录在 D1，成图在 R2。域名是 images.vcv.lv。workers.dev 在国内不稳定，支付宝的异步通知也打到这个域名。图像请求只在 Worker 里发出，参数用 Zod 校验。' />
    </p>
    <p>
      D1 没有交互式事务，积分的增减写在 SQL 触发器里：订单状态变成已支付才加积分；插入生成记录时先检查余额再扣积分；失败只从进行中退回一次。支付宝的签名和验签、密码哈希都用 Web Crypto，因为 Workers 上没有 Node.js 的加密模块。登录态是 HttpOnly cookie，有效期 30 天。
    </p>
    <LinghuiFigure
      src='/linghui/stack.jpg'
      alt='暗色工作台上的黑色模块、一个带指示灯的核心，和一排存储盘'
    />
    <blockquote>
      游客的积分和作品只在这台浏览器里。换浏览器，或清除 cookie 之后，就找不到了。要留下，需要绑定邮箱。
    </blockquote>
  </div>
)

const LayoutSlug = props => {
  const post = props?.post
  const meta = [
    post?.publishDay || post?.lastEditedDay,
    post?.category,
    ...(post?.tags || [])
  ]
    .filter(Boolean)
    .join(' · ')

  const isOffer =
    post &&
    (post.title === OFFER_TITLE ||
      String(post.slug || '').includes('ai-model-offer'))
  const isLinghui =
    post &&
    (post.title === '灵绘 AI' ||
      String(post.slug || '').includes('images-vcv'))

  if (isLinghui && !props.lock) {
    return (
      <main className='mx-auto max-w-3xl px-5 py-12 md:px-8'>
        <div className='opc-post-meta'>
          <SmartLink href='/#records' className='opc-nav-link'>
            ← 返回长期记录
          </SmartLink>
          {meta && <span className='opc-muted text-xs'>{meta}</span>}
        </div>
        <article id='article-wrapper'>
          <h1 className='opc-linghui-title'>{post.title}</h1>
          <LinghuiEssay />
          <ShareBar post={post} />
          <Comment frontMatter={post} />
        </article>
      </main>
    )
  }

  if (isOffer && !props.lock) {
    return (
      <>
        <OfferDeck />
        <div className='mx-auto max-w-3xl px-5 py-12 md:px-8'>
          <ShareBar post={post} />
          <Comment frontMatter={post} />
        </div>
      </>
    )
  }

  return (
    <main className='mx-auto max-w-3xl px-5 py-12 md:px-8'>
      <div className='opc-post-meta'>
        <SmartLink href='/#records' className='opc-nav-link'>
          ← 返回长期记录
        </SmartLink>
        {meta && <span className='opc-muted text-xs'>{meta}</span>}
      </div>
      <article id='article-wrapper'>
        {props.lock ? (
          <ArticleLock {...props} />
        ) : post ? (
          <>
            <NotionPage {...props} />
            <ShareBar post={post} />
            <Comment frontMatter={post} />
          </>
        ) : (
          <EmptyState title='没有找到内容' />
        )}
      </article>
    </main>
  )
}

const PageShell = ({ title, description, children, wide = false }) => (
  <main
    className={`mx-auto ${wide ? 'max-w-7xl' : 'max-w-3xl'} px-5 py-12 md:px-8`}
  >
    <div className='opc-eyebrow'>{siteName()}</div>
    <h1 className='mt-5 text-3xl font-semibold tracking-tight sm:text-4xl'>
      {title}
    </h1>
    {description && (
      <p className='opc-muted mt-3 max-w-2xl text-sm leading-7'>
        {description}
      </p>
    )}
    <div className='mt-10'>{children}</div>
  </main>
)

const Pager = ({ page = 1, postCount = 0, posts = [] }) => {
  const router = useRouter()
  const perPage =
    Number(siteConfig('POSTS_PER_PAGE')) || posts.length || postCount || 1
  const currentPage = Number(page) || 1
  const totalPage = Math.ceil(postCount / perPage)
  const category = router.query.category
  const tag = router.query.tag
  const basePath = router.pathname.startsWith('/category/')
    ? `/category/${Array.isArray(category) ? category[0] : category || ''}`
    : router.pathname.startsWith('/tag/')
      ? `/tag/${Array.isArray(tag) ? tag[0] : tag || ''}`
      : ''

  if (totalPage <= 1) return null

  return (
    <div className='mt-10 flex items-center justify-between text-sm'>
      <SmartLink
        href={
          currentPage <= 2
            ? basePath || '/'
            : `${basePath}/page/${currentPage - 1}`
        }
        className={
          currentPage > 1
            ? 'opc-secondary-action rounded-md border px-4 py-2'
            : 'invisible'
        }
      >
        上一页
      </SmartLink>
      <span className='opc-muted tabular-nums'>
        {currentPage} / {totalPage}
      </span>
      <SmartLink
        href={
          basePath
            ? `${basePath}/page/${currentPage + 1}`
            : `/page/${currentPage + 1}`
        }
        className={
          currentPage < totalPage
            ? 'opc-secondary-action rounded-md border px-4 py-2'
            : 'invisible'
        }
      >
        下一页
      </SmartLink>
    </div>
  )
}

const LayoutPostList = props => {
  const posts = props.posts || []

  return (
    <PageShell
      title='长期记录'
      description='AI、产品、写作和一人公司实验的公开记录。'
    >
      <div id='posts-wrapper' className='opc-records'>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id || post.slug || post.title} post={post} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
      <Pager {...props} posts={posts} />
    </PageShell>
  )
}

const LayoutSearch = props => (
  <PageShell
    title='搜索结果'
    description={props.keyword ? `关键词：${props.keyword}` : '站内搜索结果。'}
  >
    <div id='posts-wrapper' className='opc-records'>
      {(props.posts || []).length > 0 ? (
        props.posts.map(post => (
          <PostCard key={post.id || post.slug || post.title} post={post} />
        ))
      ) : (
        <EmptyState title='没有找到匹配内容' />
      )}
    </div>
  </PageShell>
)

const LayoutArchive = props => {
  const groups = Object.keys(props.archivePosts || {})

  return (
    <PageShell title='归档' description='按时间整理的长期记录。' wide>
      <div className='flex flex-col gap-10'>
        {groups.length > 0 ? (
          groups.map(year => (
            <section key={year}>
              <h2 className='opc-eyebrow'>{year}</h2>
              <div className='opc-records mt-4'>
                {(props.archivePosts[year] || []).map(post => (
                  <PostCard
                    key={post.id || post.slug || post.title}
                    post={post}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </PageShell>
  )
}

const LayoutCategoryIndex = props => (
  <PageShell title='分类' description='按主题浏览文章。'>
    <div className='flex flex-wrap gap-3'>
      {(props.categoryOptions || []).map(category => (
        <SmartLink
          key={category.name}
          href={`/category/${category.name}`}
          className='opc-secondary-action rounded-md border px-4 py-2 text-sm'
        >
          {category.name}
          {category.count ? ` (${category.count})` : ''}
        </SmartLink>
      ))}
    </div>
  </PageShell>
)

const LayoutTagIndex = props => (
  <PageShell title='标签' description='按标签浏览文章。'>
    <div className='flex flex-wrap gap-3'>
      {(props.tagOptions || []).map(tag => (
        <SmartLink
          key={tag.name}
          href={`/tag/${encodeURIComponent(tag.name)}`}
          className='opc-secondary-action rounded-md border px-4 py-2 text-sm'
        >
          {tag.name}
          {tag.count ? ` (${tag.count})` : ''}
        </SmartLink>
      ))}
    </div>
  </PageShell>
)

const Layout404 = () => (
  <PageShell title='页面不存在' description='这个地址没有找到对应内容。'>
    <ActionLink href='/' primary>
      返回首页
    </ActionLink>
  </PageShell>
)

const EmptyPage = () => <LayoutIndex />

export {
  Layout404,
  LayoutBase,
  LayoutArchive,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
