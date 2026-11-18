import { Fragment } from 'react';
import { container, linkClass, sectionHeading } from './layout';

export const intro =
  'The services I self-host on a NAS and five mini PCs at home: what each one is for, and what running it taught me.';

type Service = {
  id: string;
  name: string;
  what: string;
  usedFor: string;
  taught?: string;
  // Neighbouring services as in-page links, or a plain note when there are none.
  related: { label: string; ids?: string[] };
};

type Tile = { name: string; text: string };

type Group = { name: string; blurb: string; services?: Service[]; tiles?: Tile[] };

export const groups: Group[] = [
  {
    name: 'Build and deliver',
    blurb: 'From a git push to an image ready to run',
    services: [
      {
        id: 'gitea',
        name: 'Gitea',
        what: 'Self-hosted Git server',
        usedFor: 'Hosting all my repositories. A push here starts every build.',
        taught: 'Managing my own source control system.',
        related: { label: 'Talks to', ids: ['actions'] },
      },
      {
        id: 'actions',
        name: 'Gitea Actions',
        what: 'CI with GitHub Actions–compatible workflows',
        usedFor: 'Building, testing and publishing container images on every push.',
        taught:
          'Scaling out action runners, and building on both amd64 and arm64. The workflows use the same syntax as ' +
          'GitHub Actions, which I used at work.',
        related: { label: 'Talks to', ids: ['keeper', 'cache', 'registry'] },
      },
      {
        id: 'keeper',
        name: 'Artifact Keeper',
        what: 'Package proxy for NuGet, npm and PyPI',
        usedFor: 'Every package a build restores comes through it and is cached locally.',
        taught: "Faster builds: CI runs don't download every package from the internet each time.",
        related: { label: 'Used by', ids: ['actions'] },
      },
      {
        id: 'cache',
        name: 'Docker Registry, as a pull-through cache',
        what: 'Mirror of public base images',
        usedFor: 'Serving base images to builds from the local network instead of Docker Hub.',
        taught: "Faster builds: CI doesn't download every base image from the internet each time.",
        related: { label: 'Used by', ids: ['actions'] },
      },
      {
        id: 'registry',
        name: 'Docker Registry',
        what: 'Private image registry',
        usedFor: 'Storing the images CI builds. Arcane pulls from here when it deploys.',
        related: { label: 'Talks to', ids: ['arcane'] },
      },
    ],
  },
  {
    name: 'Run',
    blurb: 'Where the containers live',
    services: [
      {
        id: 'arcane',
        name: 'Arcane',
        what: 'Docker management with GitOps sync',
        usedFor:
          'Managing the Docker hosts on the NAS and a NUC. A webhook tells it a new image exists, then it runs a ' +
          'GitOps sync and redeploys the containers.',
        taught:
          'Making it work as one system. Running each service was easy. Wiring Gitea, Actions, the registry and ' +
          'Arcane together so a push ends up deployed with no manual steps was the real work.',
        related: { label: 'Pulls from', ids: ['registry'] },
      },
      {
        id: 'aspire',
        name: 'Aspire Dashboard',
        what: 'OpenTelemetry logs, traces and metrics',
        usedFor: 'Logs, traces and metrics from my apps in one place.',
        taught:
          "Observability doesn't have to be heavy. It gives me logs, traces and metrics with a very simple setup.",
        related: { label: 'Receives from every app' },
      },
    ],
  },
  {
    name: 'For the apps',
    blurb: 'Backing services my apps use',
    tiles: [
      { name: 'PostgreSQL', text: 'Relational database for my apps.' },
      { name: 'RabbitMQ', text: 'Message broker for my apps.' },
      {
        name: 'RustFS',
        text: 'S3-compatible object storage, so code written against AWS S3 runs at home unchanged.',
      },
    ],
  },
  {
    name: 'Automation and home',
    blurb: 'Not part of the platform, but on the same network',
    services: [
      {
        id: 'n8n',
        name: 'n8n',
        what: 'Workflow automation',
        usedFor:
          "Updating a Cloudflare DNS record with my public IP, and importing the Fuelio app's CSV export of my EV " +
          'charging and refuelling data.',
        taught: 'Small jobs that used to be a scheduled application are simpler as workflows.',
        related: { label: 'Runs on its own schedule' },
      },
    ],
    tiles: [
      { name: 'Home Assistant', text: 'Home automation, on its own NUC.' },
      { name: 'Pi-hole', text: 'Network-wide DNS and ad blocking, on its own NUC.' },
    ],
  },
];

export const services = groups.flatMap((g) => g.services ?? []);
const byId = new Map(services.map((s) => [s.id, s]));
const short = (id: string) => (id === 'cache' ? 'Registry cache' : byId.get(id)!.name);

// The path a push takes, as service ids; '+' joins services used in the same step.
export const pipeline = [
  { id: 'gitea', next: '→' },
  { id: 'actions', next: '→' },
  { id: 'keeper', next: '+' },
  { id: 'cache', next: '→' },
  { id: 'registry', next: '→' },
  { id: 'arcane', next: '' },
];

export const hardware = [
  { machine: 'UGREEN NAS + 1 Intel NUC', role: 'Docker hosts managed by Arcane, running the platform services' },
  { machine: '1 Intel NUC', role: 'Home Assistant' },
  { machine: '1 Intel NUC', role: 'Pi-hole, network-wide DNS and ad blocking' },
  { machine: '2 Intel NUCs', role: 'Kubernetes cluster, not yet in use' },
  { machine: 'UPS', role: 'Keeps it all running through power cuts' },
];

const label = 'text-[11px] font-semibold uppercase tracking-[0.12em]';
const pill = 'font-mono rounded-full';

function ServiceCard({ s }: { s: Service }) {
  return (
    <article
      id={s.id}
      className="scroll-mt-6 flex flex-col gap-4 min-w-0 rounded-2xl border border-border bg-raised p-5 target:border-accent print:break-inside-avoid"
    >
      <div className="space-y-0.5">
        <h3 className="text-[19px] leading-snug font-semibold text-strong">{s.name}</h3>
        <p className="text-[13px] text-muted">{s.what}</p>
      </div>
      <dl className="space-y-3 text-[15px]">
        <div>
          <dt className={`${label} text-accent`}>Used for</dt>
          <dd className="mt-0.5">{s.usedFor}</dd>
        </div>
        {s.taught ? (
          <div>
            <dt className={`${label} text-accent`}>Taught me</dt>
            <dd className="mt-0.5 text-strong">{s.taught}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-xs text-muted">
        {s.related.label}
        {s.related.ids?.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className={`${pill} px-2 bg-chip text-on-chip hover:bg-accent print:border print:border-border`}
          >
            {short(id)}
          </a>
        ))}
      </p>
    </article>
  );
}

function TileCard({ t }: { t: Tile }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3.5 space-y-1 print:break-inside-avoid">
      <h3 className="font-semibold text-strong">{t.name}</h3>
      <p className="text-sm">{t.text}</p>
    </div>
  );
}

export default function Homelab() {
  return (
    <div className="min-h-screen">
      <header className="bg-raised border-b border-border">
        <div className={`${container} py-10 lg:py-12 space-y-3 print:pt-0 print:pb-6`}>
          <p className="text-sm print:hidden">
            <a href="/" className={linkClass}>
              <span aria-hidden="true">←</span> Back to CV
            </a>
          </p>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Bence Molnár</p>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-none text-strong">Homelab</h1>
          <p className="pt-2 max-w-3xl text-lg text-strong">{intro}</p>
          <nav aria-label="Deploy path" className="pt-3">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm">
              <li className={`${label} mr-1.5 text-muted`} aria-hidden="true">
                A push travels
              </li>
              {pipeline.map((p) => (
                <Fragment key={p.id}>
                  <li>
                    <a
                      href={`#${p.id}`}
                      className={`${pill} block px-2.5 py-0.5 text-[13px] border border-border bg-surface text-strong hover:border-accent`}
                    >
                      {short(p.id)}
                    </a>
                  </li>
                  {p.next ? (
                    <li aria-hidden="true" className="text-accent">
                      {p.next}
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      <main className={`${container} py-10 lg:py-12 space-y-12`}>
        {groups.map((g) => (
          <section key={g.name} className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className={sectionHeading}>{g.name}</h2>
              <p className="text-sm text-muted">{g.blurb}</p>
            </div>
            {g.services ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
                {g.services.map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </div>
            ) : null}
            {g.tiles ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.tiles.map((t) => (
                  <TileCard key={t.name} t={t} />
                ))}
              </div>
            ) : null}
          </section>
        ))}

        <section className="space-y-4 print:break-inside-avoid">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className={sectionHeading}>Runs on</h2>
            <p className="text-sm text-muted">The hardware under it all</p>
          </div>
          <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {hardware.map((h) => (
              <div key={h.machine + h.role} className="space-y-0.5 border-b border-border py-2.5">
                <dt className="font-semibold text-strong">{h.machine}</dt>
                <dd>{h.role}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[15px]">
            <strong className="text-strong">Next:</strong> moving workloads onto the two-node Kubernetes cluster.
          </p>
        </section>
      </main>
    </div>
  );
}
