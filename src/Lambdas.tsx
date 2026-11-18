import { Fragment } from 'react';
import { container, linkClass, sectionHeading } from './layout';

export const intro =
  'Small, deployable Python apps I keep as templates. Three show different ways to put an authenticated HTTP API ' +
  'in front of one shared queue, and one shows an S3-triggered pipeline.';

const org = 'https://github.com/mb-dot-dev';

type App = {
  id: string;
  name: string;
  repo: string;
  what: string;
  shows: string;
  details: string[];
  // Connected apps as in-page links, or a plain note when there are none.
  related: { label: string; ids?: string[] };
};

type Group = { name: string; blurb: string; apps: App[] };

export const groups: Group[] = [
  {
    name: 'Producers',
    blurb: "Authenticated HTTP APIs that put the request body on Oslo's queue",
    apps: [
      {
        id: 'helsinki',
        name: 'Helsinki',
        repo: 'helsinki-api-gateway-rest-api',
        what: 'API Gateway REST API + Lambda',
        shows:
          'One Lambda that is both an OAuth token endpoint and a producer. It checks a client id and secret, issues ' +
          'an HS256 JWT, and puts the body of bearer-authenticated calls on the queue.',
        details: [
          'POST /oauth/token issues the token, POST / enqueues the body',
          'Client id, secret and signing key come from SSM',
          'A resource policy denies source IPs outside an SSM list',
        ],
        related: { label: 'Sends to', ids: ['oslo'] },
      },
      {
        id: 'stockholm',
        name: 'Stockholm',
        repo: 'stockholm-api-gateway-http-api',
        what: 'API Gateway HTTP API + Lambda',
        shows:
          "The gateway's built-in JWT authorizer validates tokens from an external issuer before the Lambda runs. " +
          'The Lambda then checks the client and the source IP, and puts the body on the queue.',
        details: [
          'JWT authorizer on the HTTP API route',
          "Only one client id is allowed, matched against the token's sub claim",
          'Source-IP allowlist checked in the Lambda, from SSM',
        ],
        related: { label: 'Sends to', ids: ['oslo'] },
      },
      {
        id: 'warsaw',
        name: 'Warsaw',
        repo: 'warsaw-self-signed-rest-api',
        what: 'API Gateway REST API + Lambda',
        shows:
          'Clients authenticate with private_key_jwt (RFC 7523): a JWT signed with their own private key, so there ' +
          'is no shared secret. The Lambda issues RS256 access tokens and publishes the key to verify them.',
        details: [
          'POST /oauth/token, GET /.well-known/jwks.json and POST /',
          'Signing key in SSM; the client key stays in 1Password and is used through op run',
          'A resource policy denies source IPs outside an SSM list',
        ],
        related: { label: 'Sends to', ids: ['oslo'] },
      },
    ],
  },
  {
    name: 'Queue and consumer',
    blurb: 'The shared end of the pipeline',
    apps: [
      {
        id: 'oslo',
        name: 'Oslo',
        repo: 'oslo-consumer',
        what: 'SQS queue + consumer Lambda',
        shows:
          'Owns the queue the producers send to. The consumer uses Powertools batch processing and reports partial ' +
          "batch failures, so one bad message doesn't fail the others.",
        details: [
          'A queue policy grants SendMessage by IAM principal tag',
          'Messages that are not valid JSON are counted as a metric and retried',
        ],
        related: { label: 'Receives from', ids: ['helsinki', 'stockholm', 'warsaw'] },
      },
    ],
  },
  {
    name: 'Standalone',
    blurb: 'Not connected to the others',
    apps: [
      {
        id: 'copenhagen',
        name: 'Copenhagen',
        repo: 'copenhagen-bucket-queue',
        what: 'S3 bucket → SQS → Lambda',
        shows:
          'The bucket sends object-created events to an SQS queue, and a Lambda consumes them. It reads each new ' +
          'object and records its size as a metric.',
        details: [
          'The queue policy accepts messages only from this bucket',
          'One message per invocation, with partial batch failures reported',
        ],
        related: { label: 'Runs on its own' },
      },
    ],
  },
];

export const apps = groups.flatMap((g) => g.apps);
const byId = new Map(apps.map((a) => [a.id, a]));
const nameOf = (id: string) => byId.get(id)!.name;

// The diagram: each lane is a row of steps; a step lists one or more nodes that link to an app card.
type Node = { id: string; name: string; note: string; hub?: boolean };
export const lanes: { label: string; steps: Node[][] }[] = [
  {
    label: 'Shared queue: 3 producers, 1 consumer',
    steps: [
      [
        { id: 'helsinki', name: 'Helsinki', note: 'REST API, issues its own tokens' },
        { id: 'stockholm', name: 'Stockholm', note: 'HTTP API, JWT authorizer' },
        { id: 'warsaw', name: 'Warsaw', note: 'REST API, private_key_jwt' },
      ],
      [{ id: 'oslo', name: 'Oslo queue', note: 'SQS', hub: true }],
      [{ id: 'oslo', name: 'Oslo consumer', note: 'Lambda, batch processing', hub: true }],
    ],
  },
  {
    label: 'Standalone',
    steps: [
      [{ id: 'copenhagen', name: 'S3 bucket', note: 'object created' }],
      [{ id: 'copenhagen', name: 'SQS', note: 'event notification' }],
      [{ id: 'copenhagen', name: 'Copenhagen', note: 'Lambda, reads the object' }],
    ],
  },
];

export const toolkit = [
  { name: 'Python 3.15', text: 'Every function, managed with uv' },
  { name: 'AWS Lambda Powertools', text: 'Logging, metrics, HTTP routing and batch processing' },
  { name: 'AWS SAM + CloudFormation', text: 'One small stack per concern: queue, roles, policy, function, API' },
  { name: 'Make', text: 'Install, test and lint from one entry point' },
  { name: 'pytest', text: 'Unit tests next to the code' },
  { name: 'SonarQube', text: 'Code quality analysis on every repo' },
];

const label = 'text-[11px] font-semibold uppercase tracking-[0.12em]';
const pill = 'font-mono rounded-full';

function Arrow() {
  return (
    <span aria-hidden="true" className="text-accent text-lg text-center max-md:rotate-90">
      →
    </span>
  );
}

function Diagram() {
  return (
    <nav aria-label="How the apps connect" className="rounded-2xl border border-border bg-surface p-5 space-y-5">
      {lanes.map((lane, i) => (
        <div key={lane.label} className={`space-y-3 ${i > 0 ? 'border-t border-dashed border-border pt-5' : ''}`}>
          <p className={`${label} text-muted`}>{lane.label}</p>
          <ol className="grid gap-2.5 items-center md:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
            {lane.steps.map((step, j) => (
              <Fragment key={j}>
                {j > 0 ? (
                  <li aria-hidden="true" className="flex justify-center">
                    <Arrow />
                  </li>
                ) : null}
                <li className="grid gap-2 min-w-0">
                  {step.map((n) => (
                    <a
                      key={n.name}
                      href={`#${n.id}`}
                      className={`block rounded-xl border bg-raised px-3.5 py-2.5 hover:border-accent ${n.hub ? 'border-accent' : 'border-border'}`}
                    >
                      <span className="block font-semibold text-strong">{n.name}</span>
                      <span className="block text-[13px] text-muted">{n.note}</span>
                    </a>
                  ))}
                </li>
              </Fragment>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  );
}

function AppCard({ a }: { a: App }) {
  return (
    <article
      id={a.id}
      className="scroll-mt-6 flex flex-col gap-4 min-w-0 rounded-2xl border border-border bg-raised p-5 target:border-accent print:break-inside-avoid"
    >
      <div className="space-y-0.5">
        <h3 className="text-[19px] leading-snug font-semibold text-strong">{a.name}</h3>
        <p className="text-[13px] text-muted">{a.what}</p>
      </div>
      <dl className="space-y-3 text-[15px]">
        <div>
          <dt className={`${label} text-accent`}>Shows</dt>
          <dd className="mt-0.5">{a.shows}</dd>
        </div>
        <div>
          <dt className={`${label} text-accent`}>Details</dt>
          <dd className="mt-1">
            <ul className="list-disc pl-5 space-y-1 text-sm marker:text-muted">
              {a.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted">
        <p className="flex flex-wrap items-center gap-1.5">
          {a.related.label}
          {a.related.ids?.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={`${pill} px-2 bg-chip text-on-chip hover:bg-accent print:border print:border-border`}
            >
              {nameOf(id)}
            </a>
          ))}
        </p>
        <a href={`${org}/${a.repo}`} target="_blank" rel="noopener" className={`${linkClass} font-mono`}>
          {a.repo}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

function GroupSection({ g }: { g: Group }) {
  return (
    <section className="space-y-4 min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className={sectionHeading}>{g.name}</h2>
        <p className="text-sm text-muted">{g.blurb}</p>
      </div>
      <div className={`grid gap-4 ${g.apps.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2' : ''}`}>
        {g.apps.map((a) => (
          <AppCard key={a.id} a={a} />
        ))}
      </div>
    </section>
  );
}

export default function Lambdas() {
  const [producers, ...rest] = groups;
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
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-none text-strong">
            AWS Lambda reference apps
          </h1>
          <p className="pt-2 max-w-3xl text-lg text-strong">{intro}</p>
        </div>
      </header>

      <main className={`${container} py-10 lg:py-12 space-y-12`}>
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className={sectionHeading}>How they connect</h2>
            <p className="text-sm text-muted">Select a box to jump to its app</p>
          </div>
          <Diagram />
        </section>

        <GroupSection g={producers!} />
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-4">
          {rest.map((g) => (
            <GroupSection key={g.name} g={g} />
          ))}
        </div>

        <section className="space-y-4 print:break-inside-avoid">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className={sectionHeading}>Common to all five</h2>
            <p className="text-sm text-muted">The same toolkit in every repo</p>
          </div>
          <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {toolkit.map((t) => (
              <div key={t.name} className="space-y-0.5 border-b border-border py-2.5">
                <dt className="font-semibold text-strong">{t.name}</dt>
                <dd>{t.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
