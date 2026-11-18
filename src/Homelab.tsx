import { Fragment } from 'react';
import { container, linkClass, sectionHeading, subHeading } from './layout';

const intro =
  'A self-hosted platform I built to learn and practise: push-to-deploy CI/CD, package caching, messaging, ' +
  'object storage and observability, running on a NAS and five mini PCs at home.';

export const tabs = [
  { id: 'run', label: 'What I run' },
  { id: 'fit', label: 'How it fits together' },
  { id: 'taught', label: 'What it taught me' },
] as const;

export const hardware = [
  { machine: 'UGREEN NAS + 1 Intel NUC', role: 'Docker hosts managed by Arcane, running the platform services' },
  { machine: '1 Intel NUC', role: 'Home Assistant' },
  { machine: '1 Intel NUC', role: 'Pi-hole, network-wide DNS and ad blocking' },
  { machine: '2 Intel NUCs', role: 'Kubernetes cluster, not yet in use' },
  { machine: 'UPS', role: 'Keeps it all running through power cuts' },
];

export const serviceGroups = [
  {
    name: 'Delivery',
    items: ['Gitea', 'Gitea Actions', 'Registry (Docker)', 'Artifact Keeper (NuGet, npm, PyPI)'],
  },
  { name: 'Runtime', items: ['Arcane', 'Docker'] },
  { name: 'Data & messaging', items: ['PostgreSQL', 'RabbitMQ', 'RustFS (S3-compatible)'] },
  { name: 'Observability', items: ['Aspire Dashboard (logs, traces, metrics)'] },
  { name: 'Automation & home', items: ['n8n', 'Home Assistant', 'Pi-hole'] },
];

export const flow = [
  { step: 'Push', text: 'to Gitea.' },
  {
    step: 'Build',
    text: 'in Gitea Actions, pulling packages through Artifact Keeper and base images through the registry cache.',
  },
  { step: 'Publish', text: 'the image to the local Docker registry.' },
  { step: 'Notify', text: 'a webhook tells Arcane a new version exists.' },
  { step: 'Sync', text: 'Arcane runs a GitOps sync and redeploys the containers.' },
];

export const lessons = [
  {
    title: 'Making it work as one system',
    text:
      "The hard part wasn't running each service. It was wiring Gitea, Actions, the registry and Arcane together " +
      'so a push ends up deployed with no manual steps.',
  },
  {
    title: 'Faster builds',
    text:
      'Artifact Keeper caches NuGet, npm and PyPI packages, and a local registry and registry cache serve container ' +
      "images, so CI runs don't download everything from the internet each time.",
  },
  {
    title: 'Replacing cron apps with workflows',
    text:
      'Small jobs that used to be a scheduled application are now n8n workflows: updating a Cloudflare DNS record ' +
      'with my public IP, and importing the CSV export from the Fuelio app, which holds my EV charging and ' +
      'refuelling data.',
  },
];

const chip = 'px-3 py-0.5 rounded-full bg-chip text-on-chip text-[13px] font-medium print:border print:border-border';

function WhatIRun() {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="space-y-4 min-w-0">
        <h3 className={subHeading}>Hardware</h3>
        <dl className="space-y-3 text-[15px]">
          {hardware.map((h) => (
            <div key={h.machine + h.role} className="space-y-0.5">
              <dt className="font-semibold text-strong">{h.machine}</dt>
              <dd>{h.role}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="space-y-4 min-w-0">
        <h3 className={subHeading}>Services</h3>
        <dl className="space-y-3">
          {serviceGroups.map((g) => (
            <div key={g.name} className="flex flex-wrap gap-x-3 gap-y-1.5">
              <dt className="w-36 shrink-0 pt-0.5 text-sm font-medium text-muted">{g.name}</dt>
              <dd className="flex-1 min-w-48">
                <ul className="flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <li key={s} className={chip}>
                      {s}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
        <p className="pt-2 text-[15px]">
          <strong className="text-strong">Next:</strong> moving workloads onto the two-node Kubernetes cluster.
        </p>
      </div>
    </div>
  );
}

function HowItFits() {
  return (
    <div className="space-y-6">
      <ol className="grid gap-3 md:grid-cols-5 print:grid-cols-1">
        {flow.map((f, i) => (
          <li
            key={f.step}
            className="rounded-2xl border border-border bg-raised p-4 space-y-1 print:break-inside-avoid"
          >
            <span aria-hidden="true" className="block text-sm text-muted">
              {`${i + 1}`}
            </span>
            <strong className="block font-semibold text-strong">{f.step}</strong>
            <span className="block text-[15px]">{f.text}</span>
          </li>
        ))}
      </ol>
      <p className="max-w-3xl text-[15px]">
        <strong className="text-strong">Running alongside:</strong> PostgreSQL, RabbitMQ and RustFS for apps; Aspire
        Dashboard collects logs, traces and metrics.
      </p>
    </div>
  );
}

function WhatItTaughtMe() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {lessons.map((l) => (
        <article
          key={l.title}
          className="rounded-2xl border border-border bg-raised p-5 space-y-2 print:break-inside-avoid"
        >
          <h3 className="text-[17px] leading-snug font-semibold text-strong">{l.title}</h3>
          <p className="text-[15px]">{l.text}</p>
        </article>
      ))}
    </div>
  );
}

const panels = { run: WhatIRun, fit: HowItFits, taught: WhatItTaughtMe };

export default function Homelab() {
  return (
    <div className="min-h-screen">
      <header className="bg-raised border-b border-border">
        <div className={`${container} py-12 lg:py-14 space-y-3 print:pt-0 print:pb-6`}>
          <p className="text-sm print:hidden">
            <a href="/" className={linkClass}>
              <span aria-hidden="true">←</span> Back to CV
            </a>
          </p>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Bence Molnár</p>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-none text-strong">Homelab</h1>
          <p className="pt-2 max-w-3xl text-lg text-strong">{intro}</p>
        </div>
      </header>

      <main className={`${container} py-12 lg:py-14`}>
        <div className="homelab-tabs space-y-8">
          <fieldset className="flex flex-wrap gap-x-2 border-b border-border print:hidden">
            <legend className="sr-only">Homelab sections</legend>
            {tabs.map((t, i) => (
              <Fragment key={t.id}>
                <input
                  type="radio"
                  name="homelab-tab"
                  id={`tab-${t.id}`}
                  className="sr-only"
                  defaultChecked={i === 0}
                />
                <label
                  htmlFor={`tab-${t.id}`}
                  className="cursor-pointer px-3 py-2 -mb-px border-b-2 text-[15px] font-medium"
                >
                  {t.label}
                </label>
              </Fragment>
            ))}
          </fieldset>
          {tabs.map((t) => {
            const Panel = panels[t.id];
            return (
              <section
                key={t.id}
                id={`panel-${t.id}`}
                className="homelab-panel space-y-6 print:break-inside-avoid-page"
              >
                <h2 className={`homelab-panel-heading ${sectionHeading}`}>{t.label}</h2>
                <Panel />
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
