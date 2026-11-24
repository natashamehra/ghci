'use client';
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/*
 * Homepage agenda (Day 1) — built from Figma "Homepage Agenda – Day 1".
 *
 * Two layouts share one DOM:
 *  - Desktop (lg+): values are the Figma desktop frame's px (1440 wide frame).
 *  - Mobile (<lg): the Figma mobile frame is 1080 wide, so every value is
 *    `figmaPx * --u`, where --u = min(100vw, 600px) / 1080. The design scales
 *    proportionally with the phone width and stops growing on large tablets.
 */

type Session = {
  time: string;
  title: string;
  track: string;
  format?: string;
  hall?: string;
};

type Block = {
  name: string;
  range: string;
  defaultOpen?: boolean;
  sessions: Session[];
};

type ScheduleProps = {
  data: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    description: string;
    fullAgendaText: string;
    fullAgendaLink: string;
    blocks: Block[];
    lunch?: { label: string; time: string };
    ctaTitle: string;
    ctaDescription: string;
    ctaButtonText: string;
    ctaButtonLink: string;
  };
};

const TRACK_DOTS: Record<string, string> = {
  Unconference: 'dot-unconference',
  Plenary: 'dot-plenary',
  'Under 25': 'dot-under25',
  Expo: 'dot-expo',
};

/** Renders the mobile asset below lg and the desktop asset at lg+. Parent sets the size. */
function Icon({ name }: { name: string }) {
  return (
    <>
      <img alt="" aria-hidden="true" src={`/agenda/mobile/${name}.svg`} className="absolute inset-0 block size-full max-w-none lg:hidden" />
      <img alt="" aria-hidden="true" src={`/agenda/desktop/${name}.svg`} className="absolute inset-0 hidden size-full max-w-none lg:block" />
    </>
  );
}

function ExternalIcon() {
  return (
    <span className="relative shrink-0 size-[calc(36*var(--u))] lg:size-[20px]">
      <Icon name="external" />
    </span>
  );
}

function SessionRow({ session }: { session: Session }) {
  const dot = TRACK_DOTS[session.track] ?? 'dot-unconference';
  return (
    <li className="flex w-full items-start gap-[calc(28*var(--u))] py-[calc(12*var(--u))] lg:gap-[24px] lg:py-[8px]">
      {/* Time (desktop only — on mobile it sits inside the card) */}
      <div className="hidden shrink-0 pt-[22px] lg:block">
        <p className="w-[112px] text-[18px] text-white/85">{session.time}</p>
      </div>

      {/* Timeline */}
      <div aria-hidden="true" className="relative flex w-[calc(32*var(--u))] shrink-0 flex-col items-center self-stretch lg:w-[24px]">
        <div className="min-h-px w-[calc(3*var(--u))] flex-1 bg-white/85 lg:w-[2px]" />
        <div className="absolute left-[calc(4*var(--u))] top-[calc(40*var(--u))] size-[calc(24*var(--u))] lg:left-[5px] lg:top-[30px] lg:size-[14px]">
          <img alt="" src="/agenda/mobile/point.svg" className="absolute inset-[-41.67%] block size-[183.34%] max-w-none lg:hidden" />
          <img alt="" src="/agenda/desktop/point.svg" className="absolute inset-[-71.43%] hidden size-[242.86%] max-w-none lg:block" />
        </div>
      </div>

      {/* Card */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-[calc(14*var(--u))] overflow-hidden rounded-[calc(24*var(--u))] border-[length:var(--u)] border-white/18 lg:border bg-white/6 px-[calc(36*var(--u))] py-[calc(32*var(--u))] lg:gap-[12px] lg:rounded-[14px] lg:px-[28px] lg:py-[20px]">
        <p className="text-[length:calc(30*var(--u))] text-white/85 lg:hidden">{session.time}</p>
        <h3 className="w-full text-[length:calc(40*var(--u))] font-normal text-white lg:text-[22px] lg:leading-[27px]">{session.title}</h3>
        <div className="flex w-full flex-wrap items-center gap-x-[calc(24*var(--u))] gap-y-[calc(16*var(--u))] lg:gap-x-[16px] lg:gap-y-[8px]">
          {/* Track tag */}
          <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] rounded-full border-[length:calc(2*var(--u))] border-white/18 bg-white/6 px-[calc(20*var(--u))] py-[calc(10*var(--u))] lg:gap-[8px] lg:border lg:px-[12px] lg:py-[6px]">
            <span className="relative shrink-0 size-[calc(14*var(--u))] lg:size-[8px]">
              <Icon name={dot} />
            </span>
            <span className="text-[length:calc(26*var(--u))] font-medium leading-none text-white/90 lg:text-[14px]">{session.track}</span>
          </span>

          {/* Format pill */}
          {session.format && (
            <span className="shrink-0 rounded-full border-[length:var(--u)] border-[rgba(212,106,176,0.7)] lg:border bg-[rgba(212,106,176,0.2)] px-[calc(18*var(--u))] py-[calc(6*var(--u))] text-[length:calc(26*var(--u))] font-medium leading-none text-white lg:px-[14px] lg:py-[4px] lg:text-[15px]">
              {session.format}
            </span>
          )}

          {/* Hall */}
          {session.hall && (
            <span className="flex shrink-0 items-center gap-[calc(10*var(--u))] lg:gap-[6px]">
              <span className="relative shrink-0 size-[calc(28*var(--u))] lg:size-[16px]">
                <Icon name="location" />
              </span>
              <span className="text-[length:calc(28*var(--u))] text-white/60 lg:text-[16px]">{session.hall}</span>
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function TimeBlock({ block }: { block: Block }) {
  const [open, setOpen] = useState(block.defaultOpen ?? false);
  const listId = useId();
  const count = `${block.sessions.length} sessions`;

  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full cursor-pointer items-center justify-between gap-[calc(24*var(--u))] rounded-[calc(28.8*var(--u))] border-[length:calc(2*var(--u))] px-[calc(57.6*var(--u))] py-[calc(43.2*var(--u))] text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d46ab0] lg:gap-[24px] lg:rounded-[16px] lg:border lg:px-[32px] lg:py-[24px] ${
          open
            ? 'border-white/35 bg-white/10 hover:bg-white/[0.13]'
            : 'border-white/20 bg-white/6 hover:bg-white/10'
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-[calc(36*var(--u))] gap-y-[calc(12*var(--u))] lg:flex-nowrap lg:gap-[20px]">
          <span className="whitespace-nowrap text-[length:calc(46.8*var(--u))] font-semibold text-white lg:text-[26px] lg:leading-[32px]">{block.name}</span>
          <span className="whitespace-nowrap text-[length:calc(32.4*var(--u))] text-white/70 lg:text-[18px]">{block.range}</span>
          <span className="whitespace-nowrap rounded-full border-[length:var(--u)] border-[rgba(212,106,176,0.7)] lg:border bg-[rgba(212,106,176,0.2)] px-[calc(21.6*var(--u))] py-[calc(7.2*var(--u))] text-[length:calc(25.2*var(--u))] font-medium leading-none text-white lg:px-[12px] lg:py-[4px] lg:text-[14px]">
            {count}
          </span>
        </span>
        <span className="relative shrink-0 size-[calc(50.4*var(--u))] lg:size-[28px]">
          <Icon name={open ? 'collapse' : 'expand'} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={listId}
            key="list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ul className="flex w-full flex-col pt-[calc(28.8*var(--u))] lg:pt-[16px]">
              {block.sessions.map((session, i) => (
                <SessionRow key={`${session.time}-${i}`} session={session} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DESKTOP_BG =
  'radial-gradient(31.25% 31.25% at 10% 90.63%, rgba(163,36,120,0.18) 0%, rgba(163,36,120,0) 100%), radial-gradient(31.25% 31.25% at 90.63% 10%, rgba(212,107,176,0.165) 0%, rgba(212,107,176,0) 100%), linear-gradient(180deg, rgba(69,8,56,0.5) 0%, rgba(36,5,31,0.5) 50%, rgba(77,10,61,0.5) 100%), #000';
const MOBILE_BG =
  'radial-gradient(31.25% 12.5% at 10% 85%, rgba(163,36,120,0.135) 0%, rgba(163,36,120,0) 100%), radial-gradient(31.25% 12.5% at 90.63% 10%, rgba(212,107,176,0.12) 0%, rgba(212,107,176,0) 100%), linear-gradient(180deg, rgba(69,8,56,0.6) 0%, rgba(36,5,31,0.6) 50%, rgba(77,10,61,0.6) 100%), #000';

/**
 * Fades the purple backdrop in/out at the section edges so it melts into the
 * dark page background (like the other homepage sections) instead of ending in
 * a hard line. Eased stops avoid a visible band where the fade finishes.
 */
const edgeFade = (fade: string) => {
  const stops = [
    [0, 0], [0.15, 0.04], [0.3, 0.14], [0.45, 0.3], [0.6, 0.52], [0.75, 0.74], [0.9, 0.92], [1, 1],
  ];
  const top = stops.map(([p, a]) => `rgba(0,0,0,${a}) calc(${fade} * ${p})`).join(', ');
  const bottom = [...stops].reverse().map(([p, a]) => `rgba(0,0,0,${a}) calc(100% - ${fade} * ${p})`).join(', ');
  const mask = `linear-gradient(to bottom, ${top}, ${bottom})`;
  return { WebkitMaskImage: mask, maskImage: mask };
};

export default function Schedule({ data }: ScheduleProps) {
  return (
    <section
      id="agenda"
      aria-labelledby="agenda-heading"
      className="relative w-full overflow-hidden text-white leading-[normal]"
      style={{
        ['--u' as string]: 'calc(min(100vw, 600px) / 1080)',
        // Base matches the neighbours: Passes above and Speakers below both end on #000.
        background: '#000',
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 lg:hidden" style={{ background: MOBILE_BG, ...edgeFade('160px') }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block" style={{ background: DESKTOP_BG, ...edgeFade('320px') }} />

      <div className="relative flex w-full flex-col gap-[calc(72*var(--u))] px-[calc(60*var(--u))] py-[calc(140*var(--u))] lg:gap-[40px] lg:px-[50px] lg:py-[100px]">
        {/* Header */}
        <div className="flex w-full flex-col items-start gap-[calc(32*var(--u))] lg:flex-row lg:items-end lg:justify-between lg:gap-[40px]">
          <div className="flex w-full flex-col items-start gap-[calc(28.8*var(--u))] lg:w-auto lg:min-w-0 lg:gap-[16px]">
            <p className="whitespace-nowrap text-[length:calc(28.8*var(--u))] font-semibold tracking-[calc(3.6*var(--u))] text-[#d46ab0] lg:text-[16px] lg:tracking-[2px]">
              {data.eyebrow}
            </p>
            <h2 id="agenda-heading" className="max-w-[calc(769*var(--u))] text-[length:calc(70*var(--u))] font-semibold text-white lg:max-w-none lg:text-[56px]">
              {data.titlePrefix}
              <span className="text-[#d46ab0]">{data.titleHighlight}</span>
            </h2>
            <p className="w-full text-[length:calc(36*var(--u))] text-white/70 lg:max-w-[820px] lg:text-[22px]">{data.description}</p>
          </div>
          <a
            href={data.fullAgendaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-[calc(18*var(--u))] rounded-full bg-[#a32478] px-[calc(50.4*var(--u))] py-[calc(28.8*var(--u))] transition-colors hover:bg-[#b02677] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d46ab0] lg:gap-[10px] lg:px-[28px] lg:py-[16px]"
          >
            <span className="whitespace-nowrap text-[length:calc(32.4*var(--u))] font-semibold text-white lg:text-[18px]">{data.fullAgendaText}</span>
            <ExternalIcon />
          </a>
        </div>

        {/* Accordion */}
        <div className="flex w-full flex-col gap-[calc(36*var(--u))] lg:gap-[20px]">
          {data.blocks.map((block, i) => (
            <div key={block.name} className="flex w-full flex-col gap-[calc(36*var(--u))] lg:gap-[20px]">
              <TimeBlock block={block} />
              {/* Lunch sits between the first and second block */}
              {i === 0 && data.lunch && (
                <div className="flex w-full items-center gap-[calc(28.8*var(--u))] rounded-[calc(28.8*var(--u))] border-[length:var(--u)] border-dashed lg:border border-[rgba(212,106,176,0.45)] bg-[rgba(212,106,176,0.14)] px-[calc(57.6*var(--u))] py-[calc(32.4*var(--u))] lg:gap-[16px] lg:rounded-[16px] lg:px-[32px] lg:py-[18px]">
                  <span className="relative shrink-0 size-[calc(39.6*var(--u))] lg:size-[22px]">
                    <Icon name="lunch" />
                  </span>
                  <span className="whitespace-nowrap text-[length:calc(39.6*var(--u))] font-semibold text-white lg:text-[22px]">{data.lunch.label}</span>
                  <span className="whitespace-nowrap text-[length:calc(32.4*var(--u))] text-white/70 lg:text-[18px]">{data.lunch.time}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA – Day 2 & 3 */}
        <div className="flex w-full flex-col items-start gap-[calc(43.2*var(--u))] rounded-[calc(36*var(--u))] border-[length:var(--u)] border-white/20 lg:border bg-white/6 p-[calc(72*var(--u))] lg:flex-row lg:items-center lg:justify-between lg:gap-[40px] lg:rounded-[20px] lg:p-[40px]">
          <div className="flex w-full flex-col gap-[calc(18*var(--u))] lg:w-auto lg:min-w-0 lg:gap-[10px]">
            <h3 className="text-[length:calc(54*var(--u))] font-semibold text-white lg:text-[30px]">{data.ctaTitle}</h3>
            <p className="text-[length:calc(32.4*var(--u))] text-white/70 lg:max-w-[760px] lg:text-[18px]">{data.ctaDescription}</p>
          </div>
          <a
            href={data.ctaButtonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-[calc(18*var(--u))] rounded-full border-[length:calc(2*var(--u))] border-white/80 px-[calc(50.4*var(--u))] py-[calc(28.8*var(--u))] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d46ab0] lg:gap-[10px] lg:border-[1.5px] lg:px-[28px] lg:py-[16px]"
          >
            <span className="whitespace-nowrap text-[length:calc(32.4*var(--u))] font-semibold text-white lg:text-[18px]">{data.ctaButtonText}</span>
            <ExternalIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
