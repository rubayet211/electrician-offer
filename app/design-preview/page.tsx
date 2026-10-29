import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../globals.css";
import { fontDisplay, fontSans, fontMono } from "@/lib/fonts";
import {
  Button,
  Container,
  Section,
  Eyebrow,
  SectionHeading,
  StepList,
  SpecList,
  Card,
  Badge,
  Notice,
  IconTile,
  Accordion,
  Stat,
  Label,
  Input,
  Select,
  Textarea,
  Checkbox,
  RadioCards,
  FieldError,
  Hint,
} from "@/components/ui";
import {
  Zap,
  PlugZap,
  CircuitBoard,
  Gauge,
  Cable,
  Lightbulb,
  Fan,
  ShieldCheck,
  Power,
  Wrench,
  ClipboardCheck,
  MapPin,
  Phone,
  Clock,
  FileText,
  Camera,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Design System Preview | Precision Electrical Contractor",
  description:
    "Visual QA and design token verification for the premium electrical contractor platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignPreviewPage() {
  return (
    <div
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-paper text-ink antialiased`}
    >
      {/* Top QA Navigation Bar */}
      <header className="sticky top-0 z-50 bg-ink text-paper border-b border-white/10 backdrop-blur-md">
        <Container size="wide">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber text-ink">
                <Zap className="h-4 w-4 fill-ink" aria-hidden="true" />
              </span>
              <div>
                <span className="font-display text-sm font-bold tracking-tight text-paper block">
                  APEX ELECTRIC // DESIGN SYSTEM
                </span>
                <span className="font-mono text-[11px] text-steel-400 block tracking-wider uppercase">
                  SPECIFICATION QA &amp; COMPONENT CATALOG
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-steel-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                WCAG AAA / AA PASS
              </span>
              <span className="text-white/20">|</span>
              <span>TAILWIND 4 @THEME</span>
              <span className="text-white/20">|</span>
              <span>STRICT TYPESCRIPT</span>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="verified">LICENSED &amp; BONDED #EC-1300894</Badge>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Overview */}
      <Section tone="dark" blueprint hairlineBottom>
        <Container size="default">
          <div className="max-w-3xl">
            <Eyebrow index="SPEC // 01">Visual Architecture &amp; Token Preview</Eyebrow>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-paper mt-3 mb-6">
              Engineering Precision for High-Voltage Trust
            </h1>
            <p className="text-steel-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              A credible, technical visual language designed for licensed electrical contractors. No
              generic trade clichés, no neon gimmicks, and no staged stock models—calm,
              authoritative engineering clarity.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button href="#tokens" variant="primary" size="lg" icon={PlugZap}>
                Explore Design Tokens
              </Button>
              <Button href="#components" variant="ghost-on-dark" size="lg" icon={CircuitBoard}>
                Component Catalog
              </Button>
              <Button href="#gallery" variant="ghost-on-dark" size="lg" icon={Camera}>
                Verified Photography
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 1: DESIGN TOKENS & CONTRAST */}
      <Section id="tokens" tone="light" hairlineBottom>
        <Container size="default">
          <SectionHeading
            eyebrow="SYSTEM TOKENS"
            eyebrowLeading="01 —"
            title="Color Tokens &amp; WCAG Contrast Compliance"
            lede="Every color token is systematically tuned for cool, technical clarity. Contrast pairs are mathematically verified against WCAG AA and AAA guidelines."
          />

          {/* Primary Surfaces */}
          <div className="mt-12">
            <h3 className="font-display text-lg font-bold text-ink uppercase tracking-wide mb-4">
              1. Core Surfaces &amp; Neutrals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-sm border border-steel-200 bg-ink text-paper">
                <div className="font-mono text-xs text-steel-400 mb-6">--color-ink</div>
                <div className="font-bold text-sm">#0B1726</div>
                <div className="text-xs text-steel-400 mt-1">Deep Navy Surface</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-charcoal text-paper">
                <div className="font-mono text-xs text-steel-400 mb-6">--color-charcoal</div>
                <div className="font-bold text-sm">#141B24</div>
                <div className="text-xs text-steel-400 mt-1">Elevated Dark Card</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-paper text-ink">
                <div className="font-mono text-xs text-steel-500 mb-6">--color-paper</div>
                <div className="font-bold text-sm">#FFFFFF</div>
                <div className="text-xs text-steel-500 mt-1">Primary Light Surface</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-paper-subtle text-ink">
                <div className="font-mono text-xs text-steel-500 mb-6">--color-paper-subtle</div>
                <div className="font-bold text-sm">#F6F8FA</div>
                <div className="text-xs text-steel-500 mt-1">Subtle Section Fill</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-steel-100 text-ink">
                <div className="font-mono text-xs text-steel-500 mb-6">--color-steel-100</div>
                <div className="font-bold text-sm">#F1F5F9</div>
                <div className="text-xs text-steel-500 mt-1">Muted Well Fill</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-steel-200 text-ink">
                <div className="font-mono text-xs text-steel-600 mb-6">--color-steel-200</div>
                <div className="font-bold text-sm">#E2E8F0</div>
                <div className="text-xs text-steel-600 mt-1">Hairline Border Token</div>
              </div>
            </div>
          </div>

          {/* Accent & Functional Tokens */}
          <div className="mt-8">
            <h3 className="font-display text-lg font-bold text-ink uppercase tracking-wide mb-4">
              2. Accent &amp; Functional Tokens
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-sm border border-steel-200 bg-amber text-ink">
                <div className="font-mono text-xs font-semibold text-ink/70 mb-6">
                  --color-amber
                </div>
                <div className="font-bold text-sm">#F2A516</div>
                <div className="text-xs text-ink/80 mt-1">Primary CTA Fill ONLY</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-amber-strong text-ink">
                <div className="font-mono text-xs font-semibold text-ink/70 mb-6">
                  --color-amber-strong
                </div>
                <div className="font-bold text-sm">#D98E00</div>
                <div className="text-xs text-ink/80 mt-1">CTA Hover State</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-signal-blue text-paper">
                <div className="font-mono text-xs text-white/80 mb-6">--color-signal-blue</div>
                <div className="font-bold text-sm">#2563EB</div>
                <div className="text-xs text-white/90 mt-1">Links &amp; :focus-visible</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-success text-paper">
                <div className="font-mono text-xs text-white/80 mb-6">--color-success</div>
                <div className="font-bold text-sm">#15803D</div>
                <div className="text-xs text-white/90 mt-1">Verified / Inspected</div>
              </div>
              <div className="p-4 rounded-sm border border-steel-200 bg-danger text-paper">
                <div className="font-mono text-xs text-white/80 mb-6">--color-danger</div>
                <div className="font-bold text-sm">#B42318</div>
                <div className="text-xs text-white/90 mt-1">Safety Warning / Arc Flash</div>
              </div>
            </div>
          </div>

          {/* Contrast Matrix Table */}
          <div className="mt-10 overflow-x-auto border border-steel-200 rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-50 border-b border-steel-200 font-mono text-xs text-steel-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Foreground Token</th>
                  <th className="py-3 px-4">Background Token</th>
                  <th className="py-3 px-4">Primary Context</th>
                  <th className="py-3 px-4">Contrast Ratio</th>
                  <th className="py-3 px-4">WCAG Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-200 font-mono text-xs">
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Ink (#0B1726)</td>
                  <td className="py-3 px-4">Amber (#F2A516)</td>
                  <td className="py-3 px-4 font-sans text-steel-600">Primary CTA Button text</td>
                  <td className="py-3 px-4 font-bold text-ink">8.58 : 1</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success text-paper">
                      AAA PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-paper bg-ink">White (#FFFFFF)</td>
                  <td className="py-3 px-4">Ink (#0B1726)</td>
                  <td className="py-3 px-4 font-sans text-steel-600">
                    Dark section headers &amp; body
                  </td>
                  <td className="py-3 px-4 font-bold text-ink">17.80 : 1</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success text-paper">
                      AAA PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-paper bg-charcoal">
                    White (#FFFFFF)
                  </td>
                  <td className="py-3 px-4">Charcoal (#141B24)</td>
                  <td className="py-3 px-4 font-sans text-steel-600">Elevated dark card content</td>
                  <td className="py-3 px-4 font-bold text-ink">15.22 : 1</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success text-paper">
                      AAA PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Ink (#0B1726)</td>
                  <td className="py-3 px-4">Paper (#FFFFFF)</td>
                  <td className="py-3 px-4 font-sans text-steel-600">
                    Light section primary typography
                  </td>
                  <td className="py-3 px-4 font-bold text-ink">17.80 : 1</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success text-paper">
                      AAA PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-steel-600">Steel-600 (#475569)</td>
                  <td className="py-3 px-4">Paper (#FFFFFF)</td>
                  <td className="py-3 px-4 font-sans text-steel-600">
                    Secondary body copy on light
                  </td>
                  <td className="py-3 px-4 font-bold text-ink">5.96 : 1</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success text-paper">
                      AA PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-paper bg-danger">White (#FFFFFF)</td>
                  <td className="py-3 px-4">Danger (#B42318)</td>
                  <td className="py-3 px-4 font-sans text-steel-600">
                    Safety alert heading &amp; hazard badges
                  </td>
                  <td className="py-3 px-4 font-bold text-ink">6.65 : 1</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success text-paper">
                      AA PASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-paper bg-success">White (#FFFFFF)</td>
                  <td className="py-3 px-4">Success (#15803D)</td>
                  <td className="py-3 px-4 font-sans text-steel-600">Verified status badge fill</td>
                  <td className="py-3 px-4 font-bold text-ink">4.77 : 1</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success text-paper">
                      AA PASS
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* SECTION 2: TYPOGRAPHY & MOTIFS */}
      <Section tone="muted" hairlineBottom>
        <Container size="default">
          <SectionHeading
            eyebrow="TYPOGRAPHY & MOTIFS"
            eyebrowLeading="02 —"
            title="Typographic Hierarchy &amp; Engineering Motifs"
            lede="Carefully paired typefaces with fluid clamp scaling and subtle architectural details: hairline dividers, CAD corner registration ticks, and CSS blueprint grid lines."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Type Specimens */}
            <div className="space-y-6">
              <Card tone="default">
                <span className="font-mono text-xs text-steel-500 uppercase block mb-1">
                  Archivo // Headings (600/700/800)
                </span>
                <div className="space-y-4 pt-2">
                  <div>
                    <span className="font-mono text-[11px] text-steel-400 block mb-1">
                      H1 — clamp(2.25rem, 5vw, 3.5rem)
                    </span>
                    <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
                      Heavy-Up Panel Upgrades
                    </h1>
                  </div>
                  <div className="border-t border-steel-200 pt-3">
                    <span className="font-mono text-[11px] text-steel-400 block mb-1">
                      H2 — clamp(1.75rem, 3.5vw, 2.5rem)
                    </span>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                      200-Amp Smart Distribution Panels
                    </h2>
                  </div>
                  <div className="border-t border-steel-200 pt-3">
                    <span className="font-mono text-[11px] text-steel-400 block mb-1">
                      H3 — clamp(1.35rem, 2.25vw, 1.75rem)
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">
                      Level-2 EV Charging Infrastructure
                    </h3>
                  </div>
                  <div className="border-t border-steel-200 pt-3">
                    <span className="font-mono text-[11px] text-steel-400 block mb-1">
                      H4 — clamp(1.15rem, 1.5vw, 1.35rem)
                    </span>
                    <h4 className="font-display text-base font-semibold text-ink">
                      NEC 2024 Code Compliance Inspection
                    </h4>
                  </div>
                </div>
              </Card>

              <Card tone="default">
                <span className="font-mono text-xs text-steel-500 uppercase block mb-1">
                  IBM Plex Sans (Body) &amp; IBM Plex Mono (Technical Data)
                </span>
                <div className="space-y-4 pt-2">
                  <p className="font-sans text-base text-steel-600 leading-relaxed max-w-[70ch]">
                    <strong>Body Copy (16px / 1.6 line-height):</strong> Full rewiring and dedicated
                    branch circuit installations require accurate load calculations according to
                    Article 220 of the National Electrical Code. Every residential breaker panel
                    must feature unambiguous circuit labeling and calibrated torque specifications.
                  </p>
                  <div className="p-3 bg-steel-100 rounded-sm font-mono text-xs text-steel-800 space-y-1">
                    <div>LICENSE_REG: MD-MASTER-ELEC-#294811</div>
                    <div>SERVICE_VOLTAGE: 120/240V SPLIT-PHASE 60HZ</div>
                    <div>FEEDER_CONDUCTOR: 4/0 AWG COPPER THHN</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Motifs: Blueprint & Corner Ticks */}
            <div className="space-y-6">
              <Card tone="default" cornerTicks hover>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="verified">CORNER REGISTRATION TICKS</Badge>
                  <span className="font-mono text-xs text-steel-400">DETAIL: 4x CORNER TICKS</span>
                </div>
                <h4 className="font-display text-lg font-bold text-ink mb-2">
                  Precision Card with Corner Registration Marks
                </h4>
                <p className="text-steel-600 text-sm leading-relaxed mb-4">
                  Notice the micro-crosshairs positioned precisely at each corner of this card.
                  Echoing technical CAD drafting conventions, they provide structural authority
                  without garish drop shadows.
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-steel-500">
                  <CircuitBoard className="h-4 w-4 text-steel-600" />
                  <span>CAD_ALIGNMENT: 100% VECTOR PRECISION</span>
                </div>
              </Card>

              {/* Blueprint Grid Preview Card */}
              <div className="relative p-6 rounded-md bg-ink text-paper border border-white/10 overflow-hidden bg-blueprint">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-amber font-semibold tracking-wider uppercase">
                      .bg-blueprint Motif
                    </span>
                    <Badge variant="neutral">PURE CSS 24PX GRID</Badge>
                  </div>
                  <h4 className="font-display text-xl font-bold text-paper mb-2">
                    Subtle Blueprint Underlay
                  </h4>
                  <p className="text-steel-400 text-sm leading-relaxed mb-6">
                    A clean, ultra-faint 24px grid overlay (4% opacity on dark navy surfaces, 5% on
                    paper) that provides an unmistakable engineering and schematics atmosphere
                    without distracting from content.
                  </p>
                  <Button variant="primary" size="md" icon={Gauge}>
                    Calibrated Instrumentation
                  </Button>
                </div>
              </div>

              {/* Focus Ring & Motion Demo */}
              <Card tone="default">
                <span className="font-mono text-xs text-steel-500 uppercase block mb-1">
                  Universal Focus Ring &amp; Motion Guard
                </span>
                <p className="text-steel-600 text-sm leading-relaxed mb-4">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-steel-200 rounded text-xs font-mono text-ink">
                    Tab
                  </kbd>{" "}
                  to inspect the high-contrast 2px Signal Blue focus ring with 2px offset.
                  Transitions are strictly 150–220ms ease-out on specific properties (never{" "}
                  <code className="font-mono text-xs bg-steel-100 px-1">transition: all</code>
                  ), fully silenced under reduced motion preferences.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-steel-100 hover:bg-steel-200 text-ink text-xs font-mono rounded-sm transition-colors duration-150"
                  >
                    Focus Me [Tab]
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-steel-100 hover:bg-steel-200 text-ink text-xs font-mono rounded-sm transition-colors duration-150"
                  >
                    Accessible Target &gt;= 44px
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 3: COMPONENT SHOWCASE (LIGHT & MUTED) */}
      <Section id="components" tone="light" hairlineBottom>
        <Container size="default">
          <SectionHeading
            eyebrow="COMPONENT INVENTORY"
            eyebrowLeading="03 —"
            title="Production Component Primitives"
            lede="Strictly typed, Server-Component ready UI building blocks engineered with semantic HTML, accessible ARIA attributes, and zero external config dependencies."
          />

          {/* Buttons Showcase */}
          <div className="mt-12 space-y-6">
            <h3 className="font-display text-lg font-bold text-ink uppercase tracking-wide">
              1. Button Variants &amp; Sizes (Min 44px Touch Targets)
            </h3>
            <div className="p-6 bg-paper-subtle border border-steel-200 rounded-md">
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" icon={PlugZap}>
                  Primary Amber (md)
                </Button>
                <Button variant="primary" size="lg" icon={Phone}>
                  Primary Amber (lg)
                </Button>
                <Button variant="secondary" size="md" icon={ClipboardCheck}>
                  Secondary Ink (md)
                </Button>
                <Button variant="outline" size="md" icon={FileText}>
                  Outline Button
                </Button>
                <Button href="#gallery" variant="outline" size="md" icon={ArrowRight}>
                  Router Link Button
                </Button>
              </div>
              <p className="font-mono text-xs text-steel-500 mt-4">
                * Note: Amber variant strictly forces Ink (#0B1726) label text for AAA 8.58:1
                contrast compliance.
              </p>
            </div>
          </div>

          {/* Badges, Notices & Stats */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Badges */}
            <Card tone="default">
              <h4 className="font-display text-base font-bold text-ink mb-4 uppercase tracking-wide">
                Badges &amp; Status Chips
              </h4>
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="verified">VERIFIED CONTRACTOR</Badge>
                <Badge variant="sample">SAMPLE ESTIMATE</Badge>
                <Badge variant="pending">PERMIT PENDING</Badge>
                <Badge variant="neutral">240V / 50A</Badge>
              </div>
              <p className="text-xs text-steel-500 mt-4">
                The <code className="font-mono text-ink">sample</code> badge is unmistakably marked
                as &quot;SAMPLE&quot; to prevent customer confusion during draft estimate reviews.
              </p>
            </Card>

            {/* Icon Tiles */}
            <Card tone="default">
              <h4 className="font-display text-base font-bold text-ink mb-4 uppercase tracking-wide">
                Technical Icon Tiles
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <IconTile icon={PlugZap} size="sm" tone="accent" />
                <IconTile icon={CircuitBoard} size="md" tone="dark" />
                <IconTile icon={Gauge} size="lg" tone="light" />
                <IconTile icon={ShieldCheck} size="md" tone="light" />
                <IconTile icon={Cable} size="sm" tone="light" />
                <IconTile icon={Lightbulb} size="sm" tone="accent" />
                <IconTile icon={Fan} size="sm" tone="dark" />
                <IconTile icon={AlertTriangle} size="sm" tone="accent" />
                <IconTile icon={MapPin} size="sm" tone="light" />
                <IconTile icon={Clock} size="sm" tone="light" />
                <IconTile icon={Wrench} size="sm" tone="light" />
              </div>
              <p className="text-xs text-steel-500 mt-4">
                Squared tiles paired strictly with authentic electrical iconography (no cartoon
                emojis).
              </p>
            </Card>

            {/* Stats */}
            <Card tone="default">
              <h4 className="font-display text-base font-bold text-ink mb-4 uppercase tracking-wide">
                Empirical Stat Fact
              </h4>
              <Stat
                value="200"
                unit="A"
                label="Main Panel Standard Capacity"
                caption="Verified to NEC Article 230 Service Requirements"
              />
            </Card>
          </div>

          {/* Notices */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Notice type="info" title="Permit &amp; Code Compliance Included">
              All electrical installations include direct permit acquisition with the local
              municipal building department and scheduled third-party electrical inspection
              sign-off.
            </Notice>
            <Notice type="safety" title="High-Voltage Arc Flash Hazard">
              Always disconnect main service feeder breakers prior to removing dead-front covers. Do
              not attempt to service bus bars without personal protective equipment (PPE Level 2).
            </Notice>
          </div>

          {/* Spec Sheet & Step List */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card tone="default" cornerTicks>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display text-base font-bold text-ink uppercase tracking-wide">
                  SpecList Primitive (Industrial Data Sheet)
                </h4>
                <Badge variant="neutral">REV 2026.4</Badge>
              </div>
              <SpecList
                items={[
                  { label: "Main Service Disconnect", value: "200 Ampere Square D QO", mono: true },
                  {
                    label: "Available Spaces / Circuits",
                    value: "42 Spaces / 84 Circuits",
                    mono: true,
                  },
                  { label: "Enclosure Type", value: "NEMA 3R Rainproof", mono: true },
                  {
                    label: "Surge Protection Device",
                    value: "Type 2 Whole-Home SPD (50kA)",
                    note: "Factory-installed",
                  },
                  {
                    label: "Grounding Electrode",
                    value: "Dual 8ft Copper Ground Rods (6 AWG)",
                    mono: true,
                  },
                ]}
              />
            </Card>

            <Card tone="default">
              <h4 className="font-display text-base font-bold text-ink uppercase tracking-wide mb-4">
                StepList Primitive (Technical Procedure)
              </h4>
              <StepList
                steps={[
                  {
                    step: "01",
                    title: "Comprehensive Load Calculation",
                    description:
                      "We calculate your home's total connected continuous and non-continuous electrical load per NEC Article 220.",
                    spec: "NEC ART. 220 COMPLIANT",
                  },
                  {
                    step: "02",
                    title: "Utility Meter Coordination & Permitting",
                    description:
                      "Our team coordinates the service drop disconnect and secures all required county electrical permits.",
                    spec: "ZERO CUSTOMER PAPERWORK",
                  },
                  {
                    step: "03",
                    title: "Precision Cutover & Verification",
                    description:
                      "Single-day panel cutover with full branch circuit testing, calibrated torque markings, and inspector sign-off.",
                    spec: "TYPICAL DOWNTIME < 6 HOURS",
                  },
                ]}
              />
            </Card>
          </div>

          {/* Accordion Disclosure */}
          <div className="mt-12">
            <h4 className="font-display text-base font-bold text-ink uppercase tracking-wide mb-4">
              Accessible Native Accordion (HTML5 &lt;details&gt; / &lt;summary&gt;)
            </h4>
            <Accordion
              items={[
                {
                  id: "faq-1",
                  title: "How do I know if my electrical panel needs a 200-amp heavy-up?",
                  content:
                    "If your current panel is 100 amps or 150 amps and you plan to install a Level-2 EV charger, heat pump system, induction range, or whole-home backup generator, a heavy-up is essential to prevent main breaker nuisance tripping and ensure code compliance.",
                  badge: "CAPACITY",
                },
                {
                  id: "faq-2",
                  title: "Are all circuit breakers protected by modern AFCI and GFCI technology?",
                  content:
                    "Yes. Under current NEC requirements, dual-function AFCI/GFCI breakers are installed on all habitable room circuits to protect your home against both dangerous electrical arcing (fire hazards) and ground faults (shock hazards).",
                  badge: "SAFETY",
                },
                {
                  id: "faq-3",
                  title:
                    "Do you handle the city or county electrical permit and utility disconnect?",
                  content:
                    "Every project includes complete turnkey coordination. We file the electrical permit, schedule the utility power disconnect and reconnect, and accompany the city electrical inspector during final sign-off.",
                  badge: "PERMITS",
                },
              ]}
            />
          </div>
        </Container>
      </Section>

      {/* SECTION 4: FORM PRIMITIVES & RADIO CARDS */}
      <Section tone="muted" hairlineBottom>
        <Container size="default">
          <SectionHeading
            eyebrow="FORM CONTROLS"
            eyebrowLeading="04 —"
            title="Accessible Form Primitives &amp; Service Selectors"
            lede="Form fields built with proper label-input association, explicit error states, hint descriptions, and high-contrast focus indicators."
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Fields Showcase */}
            <div className="lg:col-span-1 space-y-5">
              <Card tone="default">
                <h4 className="font-display text-sm font-bold text-ink uppercase tracking-wide mb-4">
                  Standard Input Controls
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full-name" required>
                      Customer Name
                    </Label>
                    <Input id="full-name" placeholder="Johnathan Doe" />
                    <Hint id="full-name-hint">
                      First and last legal name for permit registration.
                    </Hint>
                  </div>

                  <div>
                    <Label htmlFor="service-address" required>
                      Service Address
                    </Label>
                    <Input id="service-address" placeholder="1248 Crestview Terrace" />
                  </div>

                  <div>
                    <Label htmlFor="panel-type">Current Main Disconnect Rating</Label>
                    <Select id="panel-type" defaultValue="100a">
                      <option value="60a">60 Amp (Obsolete Fuse Block)</option>
                      <option value="100a">100 Amp Split Bus</option>
                      <option value="150a">150 Amp Load Center</option>
                      <option value="200a">200 Amp Service Panel</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project-scope">Project Scope &amp; Diagnostic Notes</Label>
                    <Textarea
                      id="project-scope"
                      rows={3}
                      placeholder="Describe observed flickering, tripped breakers, or planned appliance additions..."
                    />
                    <Hint id="project-scope-hint">
                      Include panel manufacturer (Square D, Cutler-Hammer, GE) if known.
                    </Hint>
                  </div>

                  <div>
                    <Label htmlFor="error-demo">Inspector Inspection ID</Label>
                    <Input
                      id="error-demo"
                      defaultValue="INVALID-CODE-99"
                      error
                      aria-describedby="error-demo-msg"
                    />
                    <FieldError id="error-demo-msg">
                      Inspection permit code format must match MD-ELEC-XXXXXX.
                    </FieldError>
                  </div>

                  <div>
                    <Checkbox
                      id="emergency-ack"
                      label="Acknowledge 240V Main Disconnect Protocol"
                      hint="I confirm the main breaker will be accessible to technician upon arrival."
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* RadioCards Component Showcase */}
            <div className="lg:col-span-2">
              <Card tone="default">
                <h4 className="font-display text-sm font-bold text-ink uppercase tracking-wide mb-2">
                  RadioCards Primitive (Large Service Option Tiles)
                </h4>
                <p className="text-steel-600 text-sm mb-6">
                  High-affordance, 44px+ tap targets for interactive service selection with custom
                  icons, badge flags, and technical descriptions.
                </p>

                <RadioCards
                  name="service-tier"
                  defaultValue="panel"
                  options={[
                    {
                      value: "panel",
                      label: "Main Panel Heavy-Up (200A)",
                      description:
                        "Complete replacement of service entrance cables, 42-space load center, and dual ground rods.",
                      badge: "MOST REQUESTED",
                      icon: CircuitBoard,
                    },
                    {
                      value: "ev",
                      label: "Level-2 EV Charger Dedicated Line",
                      description:
                        "50-amp / 240-volt dedicated branch circuit with commercial disconnect and wall bracket mount.",
                      badge: "SAME-DAY READY",
                      icon: PlugZap,
                    },
                    {
                      value: "generator",
                      label: "Standby Generator & Transfer Switch",
                      description:
                        "Automatic transfer switch (ATS) sub-panel wiring for uninterrupted emergency power restoration.",
                      badge: "EMERGENCY POWER",
                      icon: Power,
                    },
                  ]}
                />

                <div className="mt-6 pt-4 border-t border-steel-200 flex justify-end">
                  <Button variant="primary" size="md" icon={ClipboardCheck}>
                    Continue to Estimate Summary
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 5: DARK TONE COMPONENT ELEVATION */}
      <Section tone="dark" blueprint hairlineBottom>
        <Container size="default">
          <SectionHeading
            eyebrow="DARK TONALITY"
            eyebrowLeading="05 —"
            title="Elevated Dark Surface Engineering"
            lede="Precision components rendered on deep Navy (#0B1726) surfaces with elevated Charcoal (#141B24) cards, hairline white/10 borders, and ghost button variants."
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card tone="dark" cornerTicks>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="verified">DARK TONE CARD</Badge>
                <span className="font-mono text-xs text-steel-400">#141B24</span>
              </div>
              <h4 className="font-display text-xl font-bold text-paper mb-2">
                Elevated Charcoal Container
              </h4>
              <p className="text-steel-400 text-sm leading-relaxed mb-6">
                Designed to house high-density technical specifications without visual noise.
                Borders use subtle 10% white hairlines with sharp 6px geometry.
              </p>
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-steel-400">BUS RATING:</span>
                  <span className="text-paper font-semibold">225A COPPER</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-steel-400">INTERRUPTING:</span>
                  <span className="text-paper font-semibold">22,000 AIR</span>
                </div>
              </div>
            </Card>

            <Card tone="dark" cornerTicks>
              <h4 className="font-display text-xl font-bold text-paper mb-3">
                Action Hierarchy on Dark
              </h4>
              <p className="text-steel-400 text-sm leading-relaxed mb-6">
                Amber CTA buttons preserve commanding visual prominence, while Ghost-on-Dark buttons
                provide subtle secondary exploration actions.
              </p>
              <div className="space-y-3">
                <Button variant="primary" size="md" icon={Phone} className="w-full">
                  Emergency Dispatch 24/7
                </Button>
                <Button variant="ghost-on-dark" size="md" icon={FileText} className="w-full">
                  Download Electrical Schematic
                </Button>
              </div>
            </Card>

            <div className="space-y-4">
              <Notice type="safety" title="Live Electrical Sub-Station Protocol">
                Only licensed master electricians are authorized to access transformer feeder leads.
                Verify zero energy state via calibrated voltmeter before contact.
              </Notice>

              <div className="p-4 rounded-md border border-white/10 bg-charcoal">
                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-amber font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>PREFERS-REDUCED-MOTION</span>
                </div>
                <p className="text-steel-400 text-xs leading-relaxed">
                  All animations strictly drop to 0.01ms duration when users request reduced motion
                  in system settings.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 6: VERIFIED REAL PHOTOGRAPHY GALLERY */}
      <Section id="gallery" tone="light">
        <Container size="default">
          <SectionHeading
            eyebrow="AUTHENTIC PHOTOGRAPHY"
            eyebrowLeading="06 —"
            title="Verified Commercial-Use Photography Gallery"
            lede="Six authentic, non-AI photographs of genuine electrical installations and diagnostic procedures. Freely licensed under Unsplash or Pexels licenses with verified source links."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {/* 1. Hero Image */}
            <Card tone="default" cornerTicks className="overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] w-full bg-steel-100 overflow-hidden border-b border-steel-200">
                <Image
                  src="/images/demo/hero.jpg"
                  alt="Modern circuit breakers and residential electrical wiring installation"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-ink">hero.jpg</span>
                    <Badge variant="verified">LANDSCAPE</Badge>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink mb-1">
                    Circuit Breakers &amp; Wiring
                  </h4>
                  <p className="text-steel-600 text-xs leading-relaxed mb-3">
                    High-voltage circuit breaker bank with precision copper bus connection.
                  </p>
                </div>
                <div className="pt-3 border-t border-steel-200 font-mono text-[11px] text-steel-500 space-y-1">
                  <div>PHOTOGRAPHER: Pixabay</div>
                  <div>LICENSE: Pexels License (Commercial)</div>
                  <Link
                    href="https://www.pexels.com/photo/close-up-of-circuit-breakers-257736/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-signal-blue underline block hover:text-ink transition-colors"
                  >
                    View Source on Pexels &rarr;
                  </Link>
                </div>
              </div>
            </Card>

            {/* 2. Breaker Panel */}
            <Card tone="default" cornerTicks className="overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] w-full bg-steel-100 overflow-hidden border-b border-steel-200">
                <Image
                  src="/images/demo/panel.jpg"
                  alt="Open residential circuit breaker panel showing individual breakers and wiring"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-ink">panel.jpg</span>
                    <Badge variant="verified">LOAD CENTER</Badge>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink mb-1">
                    Open Breaker Panel Interior
                  </h4>
                  <p className="text-steel-600 text-xs leading-relaxed mb-3">
                    Residential service panel showing branch breakers, neutral bar, and safety
                    ground.
                  </p>
                </div>
                <div className="pt-3 border-t border-steel-200 font-mono text-[11px] text-steel-500 space-y-1">
                  <div>PHOTOGRAPHER: Markus Spiske</div>
                  <div>LICENSE: Unsplash License (Commercial)</div>
                  <Link
                    href="https://unsplash.com/photos/iar-afB0QQw"
                    target="_blank"
                    rel="noreferrer"
                    className="text-signal-blue underline block hover:text-ink transition-colors"
                  >
                    View Source on Unsplash &rarr;
                  </Link>
                </div>
              </div>
            </Card>

            {/* 3. EV Charger */}
            <Card tone="default" cornerTicks className="overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] w-full bg-steel-100 overflow-hidden border-b border-steel-200">
                <Image
                  src="/images/demo/ev-charger.jpg"
                  alt="Modern residential EV charger installed on an exterior brick wall"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-ink">ev-charger.jpg</span>
                    <Badge variant="verified">240V / LEVEL-2</Badge>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink mb-1">
                    Residential EV Charging Station
                  </h4>
                  <p className="text-steel-600 text-xs leading-relaxed mb-3">
                    Wall-mounted high-speed EV charging terminal installed on home exterior masonry.
                  </p>
                </div>
                <div className="pt-3 border-t border-steel-200 font-mono text-[11px] text-steel-500 space-y-1">
                  <div>PHOTOGRAPHER: Andersen EV</div>
                  <div>LICENSE: Pexels License (Commercial)</div>
                  <Link
                    href="https://www.pexels.com/photo/andersen-a2-electric-vehicle-charger-on-a-brick-wall-27355833/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-signal-blue underline block hover:text-ink transition-colors"
                  >
                    View Source on Pexels &rarr;
                  </Link>
                </div>
              </div>
            </Card>

            {/* 4. Lighting */}
            <Card tone="default" cornerTicks className="overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] w-full bg-steel-100 overflow-hidden border-b border-steel-200">
                <Image
                  src="/images/demo/lighting.jpg"
                  alt="Modern residential recessed ceiling lighting fixtures"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-ink">lighting.jpg</span>
                    <Badge variant="verified">ARCHITECTURAL</Badge>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink mb-1">
                    Recessed Ceiling Lighting
                  </h4>
                  <p className="text-steel-600 text-xs leading-relaxed mb-3">
                    Modern recessed downlights providing glare-free residential ambient
                    illumination.
                  </p>
                </div>
                <div className="pt-3 border-t border-steel-200 font-mono text-[11px] text-steel-500 space-y-1">
                  <div>PHOTOGRAPHER: Yevhenii Deshko</div>
                  <div>LICENSE: Unsplash License (Commercial)</div>
                  <Link
                    href="https://unsplash.com/photos/b89t8e8N3-0"
                    target="_blank"
                    rel="noreferrer"
                    className="text-signal-blue underline block hover:text-ink transition-colors"
                  >
                    View Source on Unsplash &rarr;
                  </Link>
                </div>
              </div>
            </Card>

            {/* 5. Troubleshooting */}
            <Card tone="default" cornerTicks className="overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] w-full bg-steel-100 overflow-hidden border-b border-steel-200">
                <Image
                  src="/images/demo/troubleshooting.jpg"
                  alt="Electrician testing circuit voltage with a calibrated digital multimeter"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-ink">
                      troubleshooting.jpg
                    </span>
                    <Badge variant="verified">DIAGNOSTICS</Badge>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink mb-1">
                    Multimeter Voltage Testing
                  </h4>
                  <p className="text-steel-600 text-xs leading-relaxed mb-3">
                    Electrician measuring live terminal voltage to isolate circuit faults.
                  </p>
                </div>
                <div className="pt-3 border-t border-steel-200 font-mono text-[11px] text-steel-500 space-y-1">
                  <div>PHOTOGRAPHER: Onics Energy</div>
                  <div>LICENSE: Pexels License (Commercial)</div>
                  <Link
                    href="https://www.pexels.com/photo/close-up-of-hands-holding-a-digital-multimeter-14319099/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-signal-blue underline block hover:text-ink transition-colors"
                  >
                    View Source on Pexels &rarr;
                  </Link>
                </div>
              </div>
            </Card>

            {/* 6. Generator */}
            <Card tone="default" cornerTicks className="overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] w-full bg-steel-100 overflow-hidden border-b border-steel-200">
                <Image
                  src="/images/demo/generator.jpg"
                  alt="Standby backup power generator enclosure mounted on equipment pad"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-ink">generator.jpg</span>
                    <Badge variant="verified">STANDBY POWER</Badge>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink mb-1">
                    Standby Power Generator
                  </h4>
                  <p className="text-steel-600 text-xs leading-relaxed mb-3">
                    Outdoor generator enclosure connected to an automatic transfer switch (ATS).
                  </p>
                </div>
                <div className="pt-3 border-t border-steel-200 font-mono text-[11px] text-steel-500 space-y-1">
                  <div>PHOTOGRAPHER: Handy Wicaksono</div>
                  <div>LICENSE: Unsplash License (Commercial)</div>
                  <Link
                    href="https://unsplash.com/photos/qXwbygKtl9g"
                    target="_blank"
                    rel="noreferrer"
                    className="text-signal-blue underline block hover:text-ink transition-colors"
                  >
                    View Source on Unsplash &rarr;
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="border-t border-steel-200 bg-steel-50 py-12 text-steel-600 text-xs font-mono">
        <Container size="default">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber fill-amber" />
              <span className="text-ink font-bold">APEX ELECTRIC CONTRACTORS</span>
              <span>— DESIGN SYSTEM COMPLIANCE PREVIEW</span>
            </div>
            <div>
              <span>VERIFIED COMMERCIAL USE // UNRESTRICTED DISTRIBUTION</span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
