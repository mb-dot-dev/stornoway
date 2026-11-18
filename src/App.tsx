import awsLogo from './assets/aws.svg';
import { container, linkClass, sectionHeading, subHeading } from './layout';

const name = 'Bence Molnár';
const jobTitle = 'Senior Software Engineer';
const location = 'Budapest, Hungary';
const email = 'hiring@molnarbence.dev';
const github = { handle: 'molnarbence', url: 'https://github.com/molnarbence' };
const githubOrg = { handle: 'mb-dot-dev', url: 'https://github.com/mb-dot-dev' };
const summary =
  'Senior Software Engineer with 15+ years in .NET (C#) and 3 years in Python, building on AWS. ' +
  'At Skyscanner I owned the SOx-compliant finance systems behind £40M+ a month of partner billing, ' +
  'and cut audit-logging costs to ~$3 a week. ' +
  'Earlier, at Agoda, I shipped a home page redesign that grew revenue by 7%.';
export const highlights = [
  {
    lead: 'Built the billing pipeline',
    text:
      " behind Skyscanner's partner invoicing: Apache Spark jobs turning 2–3M redirects a month per revenue-tracking configuration " +
      'into £40M+ a month of billable revenue across 1,200 partners, mission-critical during the first-week-of-month billing cycle.',
  },
  {
    lead: 'Grew revenue 7%',
    text: ' with a single A/B test of the redesigned, search-led Agoda home page.',
  },
  {
    lead: 'Made xe.com the single source of truth for exchange rates',
    text: ' across all financial systems (Workday, Kyriba), eliminating conversion rate differences between them.',
  },
  {
    lead: 'Replaced Splunk alerting',
    text:
      ' for 4 SOx-scoped production databases with an in-house system that runs for about $3 a week on AWS, ' +
      "so Splunk could be decommissioned for this use and audit logs stayed in Skyscanner's own AWS estate.",
  },
  {
    lead: 'Owned SOx compliance',
    text:
      ' for the finance tooling: IT general controls across ~15 repos plus 4 financial controls, ' +
      'tightening access by applying least privilege, including separate database users for migrations and the web app.',
  },
  {
    lead: 'Engineering lead for Finance:',
    text: ' the main point of contact for the finance team, on the on-call rota, and mentor to junior engineers.',
  },
];
export const languages = [
  { name: 'English', level: 'fluent' },
  { name: 'Hungarian', level: 'native' },
];
export const interests = ['scouting', 'drone photography', 'astronomy', 'gastronomy', 'home automation'];
export const skillGroups = [
  { name: 'Languages', items: ['C#', 'Python', 'TypeScript', 'SQL'] },
  { name: 'Frameworks & data', items: ['.NET', 'Node.js', 'Apache Spark', 'Kafka'] },
  {
    name: 'Cloud & infra',
    items: [
      'AWS Batch',
      'AWS Lambda',
      'AWS S3',
      'AWS CloudWatch',
      'AWS Firehose',
      'AWS CloudFormation',
      'Kubernetes',
      'GitHub Actions',
    ],
  },
  { name: 'Databases', items: ['SQL Server', 'PostgreSQL', 'MySQL'] },
  { name: 'Domain', items: ['Financial systems', 'SOx compliance', 'Audit & controls'] },
];
export const skills = skillGroups.flatMap((g) => g.items);

// Experience with multiple projects per company (no bullets)
export const experiences = [
  {
    company: 'Skyscanner',
    title: 'Senior Software Engineer',
    period: '2019 — 2026',
    location: 'London, UK',
    projects: [
      {
        name: 'SOx scoped database monitoring',
        description:
          'Led the design and build of an in-house privileged-access monitoring system for the 4 SOx-scoped production databases, ' +
          'replacing Splunk alerting so it could be decommissioned and keeping audit logs within our own AWS estate. ' +
          'Runs for about $3 a week on AWS Batch, Firehose streaming and S3 archiving, ' +
          'and gives external auditors a self-serve evidence trail.',
        tech: ['Python', 'AWS Batch', 'AWS CloudWatch', 'AWS Firehose', 'AWS S3'],
      },
      {
        name: 'Bespoke Financial Tools',
        description:
          "Led development of Skyscanner's in-house finance tooling. " +
          'Built the billing staging pipeline: Apache Spark jobs aggregated 2–3 million redirects a month per revenue-tracking configuration ' +
          'and attributed the billable revenue to partner accounts, ready for finance to invoice. ' +
          'Integrated with the trade-credit insurer: open invoices were sent for coverage and partner credit limits were synced back to Customer records in Workday. ' +
          'Automated loading of xe.com exchange rates into Workday and the Kyriba treasury system, ' +
          'making xe.com the single source of truth for rates across all financial systems and eliminating conversion rate differences.',
        tech: [
          'C#',
          'Python',
          'TypeScript',
          '.NET',
          'Apache Spark',
          'Kubernetes',
          'AWS',
          'Node.js',
          'SQL Server',
          'Postgres',
          'MySQL',
        ],
      },
      {
        name: 'SOx control ownership',
        description:
          'SOx control owner for the finance tooling: IT general controls across ~15 repositories plus 4 financial controls. ' +
          'Ran the quarterly control audits and user access reviews, and documented how control evidence is provided to auditors. ' +
          'Continuously tightened access by applying least privilege, including separate database users for schema migrations and the web app.',
      },
      {
        name: 'Python application configuration facility',
        description:
          'Built an internal Python package that gives one API for loading application configuration from multiple sources, ' +
          "including the internal secret vault. Adopted across the team's 10 AWS Batch jobs and 5 Lambda functions, " +
          'replacing duplicated config-loading code.',
        tech: ['Python'],
      },
    ],
  },
  {
    company: 'Mimecast',
    title: 'Senior Software Engineer',
    period: '2017 — 2019',
    location: 'London, UK',
    projects: [
      {
        name: 'Email ingestion system',
        description:
          "Developed and maintained the email ingestion platform that imported new customers' existing mailbox archives into Mimecast, " +
          'a key step in customer onboarding.',
        tech: ['.NET', 'C#'],
      },
    ],
  },
  {
    company: 'Agoda',
    title: 'Senior Software Engineer',
    period: '2014 — 2017',
    location: 'Bangkok, Thailand',
    projects: [
      {
        name: 'PIX Image Platform',
        description:
          'Led the handover of the PIX image platform from the Budapest team to Bangkok HQ. ' +
          'Then migrated the main service to cross-platform .NET Core 2.0, removing the need for Windows Server licences ' +
          'by replacing the Windows-only System.Drawing image library with open-source alternatives, ' +
          'and moved image-upload processing onto Kafka to spread the workload.',
        tech: ['.NET', 'C#', 'Kafka', 'Cassandra'],
      },
      {
        name: 'Experimentation Platform',
        description:
          'Built features for the UI of the experimentation platform, which product owners used to set up and manage their A/B tests.',
        tech: ['TypeScript', 'AngularJS'],
      },
      {
        name: 'Agoda Home Page',
        description:
          'Delivered the redesigned, search-led responsive home page (August 2014), which increased revenue by 7% in a single A/B test.',
        tech: ['ASP.NET', 'C#', 'JavaScript'],
      },
    ],
  },
  {
    company: 'NK Services',
    title: 'Software Engineer',
    period: '2010 — 2014',
    location: 'Budapest, Hungary',
    projects: [
      {
        name: 'VodaMail Web Management - Vodafone Hungary',
        description:
          "Developed and maintained the web management portal for VodaMail, Vodafone Hungary's email service for its mobile customers.",
        tech: ['ASP.NET', 'C#', 'JavaScript', 'SQL Server'],
      },
    ],
  },
];

export const education = [
  {
    school: 'Budapest University of Technology and Economics',
    degree: 'Software Engineering studies (BSc programme, not completed)',
    period: '2007 — 2009',
  },
];

function Period({ period }: { period: string }) {
  const [from, to] = period.split(' — ');
  return (
    <>
      <time dateTime={from}>{from}</time>
      {to ? (
        <>
          {' — '}
          <time dateTime={to}>{to}</time>
        </>
      ) : null}
    </>
  );
}

function GitHubLink({ handle, url, kind }: { handle: string; url: string; kind: string }) {
  return (
    <a href={url} target="_blank" rel="noopener" className={linkClass}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.35-1.087.636-1.337-2.221-.253-4.555-1.112-4.555-4.948 0-1.092.39-1.986 1.029-2.685-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.685 0 3.845-2.337 4.692-4.566 4.94.359.31.678.922.678 1.859 0 1.342-.012 2.424-.012 2.754 0 .268.18.58.688.481A10.004 10.004 0 0 0 22 12c0-5.523-4.477-10-10-10Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="sr-only">{`GitHub ${kind} `}</span>
      <span>{`/${handle}`}</span>
    </a>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-raised border-b border-border">
        <div
          className={`${container} py-12 lg:py-14 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 print:pt-0 print:pb-6`}
        >
          <div className="flex-[1_1_32rem] space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{jobTitle}</p>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-none text-strong">{name}</h1>
            <p className="pt-2 max-w-3xl text-lg text-strong">{summary}</p>
          </div>
          <ul className="flex-[0_1_17rem] space-y-2 text-[15px]">
            <li className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4 shrink-0"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <span>{location}</span>
            </li>
            <li>
              <a href={`mailto:${email}`} className={`${linkClass} gap-2`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 7.5l-8.486 5.657a3 3 0 01-3.528 0L1.25 7.5m20.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75h15a2.25 2.25 0 002.25-2.25v-9z"
                  />
                </svg>
                <span>{email}</span>
              </a>
            </li>
            <li>
              <GitHubLink {...github} kind="profile" />
            </li>
            <li>
              <GitHubLink {...githubOrg} kind="organisation" />
            </li>
            <li className="print:hidden">
              <a href="/homelab/" className={`${linkClass} gap-2`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z"
                  />
                </svg>
                <span>Homelab</span>
              </a>
            </li>
            <li className="print:hidden">
              <a href="/lambdas/" className={`${linkClass} gap-2`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                  />
                </svg>
                <span>Lambda apps</span>
              </a>
            </li>
          </ul>
        </div>
      </header>

      <main className={`${container} py-12 lg:py-14 space-y-16 print:space-y-10`}>
        {/* Highlights */}
        <section className="space-y-5">
          <h2 className={sectionHeading}>Highlights</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h, i) => (
              <li
                key={h.lead}
                className="rounded-2xl border border-border bg-raised p-5 space-y-2 print:break-inside-avoid"
              >
                <span aria-hidden="true" className="block text-sm text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <strong className="block text-[17px] leading-snug font-semibold text-strong">{h.lead}</strong>
                <span className="block text-[15px]">{h.text.trim()}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Experience */}
        <section className="space-y-7">
          <h2 className={sectionHeading}>Experience</h2>
          <ol>
            {experiences.map((exp) => (
              <li
                key={exp.company}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] sm:grid-cols-[11rem_1.75rem_minmax(0,1fr)] gap-x-4 sm:gap-x-5 print:break-inside-avoid-page"
              >
                <div className="hidden sm:flex flex-col items-end text-right pt-0.5">
                  <span className="text-lg font-semibold text-strong">
                    <Period period={exp.period} />
                  </span>
                  <span className="text-sm text-muted">{exp.location}</span>
                </div>
                <div aria-hidden="true" className="flex flex-col items-center">
                  <div className="mt-2 size-3.5 shrink-0 rounded-full bg-accent ring-[5px] ring-surface" />
                  <div className="w-0.5 flex-1 bg-border" />
                </div>
                <div className="pb-12 space-y-4">
                  <div className="space-y-0.5">
                    <h3 className="text-[22px] font-semibold text-strong">
                      {exp.company}
                      <span className="text-base font-normal text-muted">{` — ${exp.title}`}</span>
                    </h3>
                    <p className="sm:hidden text-sm text-muted">
                      <Period period={exp.period} />
                      {` · ${exp.location}`}
                    </p>
                  </div>
                  {exp.projects.map((p) => (
                    <div key={p.name} className="space-y-1.5 print:break-inside-avoid">
                      <h4 className="font-semibold text-strong">{p.name}</h4>
                      <p>{p.description}</p>
                      {'tech' in p && p.tech?.length ? (
                        <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Technologies">
                          {p.tech.map((tech) => (
                            <li
                              key={tech}
                              className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-chip text-on-chip print:border print:border-border"
                            >
                              {tech}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-x-10 gap-y-10 pt-10 border-t border-border md:grid-cols-2 lg:grid-cols-4">
          {/* Skills */}
          <section className="space-y-4 md:col-span-2 print:break-inside-avoid">
            <h2 className={subHeading}>Skills</h2>
            <dl className="space-y-3">
              {skillGroups.map((g) => (
                <div key={g.name} className="flex flex-wrap gap-x-3 gap-y-1.5">
                  <dt className="w-36 shrink-0 pt-0.5 text-sm font-medium text-muted">{g.name}</dt>
                  <dd className="flex-1 min-w-48">
                    <ul className="flex flex-wrap gap-1.5">
                      {g.items.map((s) => (
                        <li
                          key={s}
                          className="px-3 py-0.5 rounded-full bg-chip text-on-chip text-[13px] font-medium print:border print:border-border"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Education */}
          <section className="space-y-4">
            <h2 className={subHeading}>Education</h2>
            <ul className="space-y-3 text-[15px]">
              {education.map((e) => (
                <li key={e.school}>
                  <p className="font-semibold text-strong">{e.school}</p>
                  <p>{e.degree}</p>
                  <p className="text-muted">
                    <Period period={e.period} />
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-8">
            {/* Languages */}
            <section className="space-y-4">
              <h2 className={subHeading}>Languages</h2>
              <p className="text-[15px]">{languages.map((l) => `${l.name} (${l.level})`).join(', ')}</p>
            </section>

            {/* Interests */}
            <section className="space-y-4">
              <h2 className={subHeading}>Interests</h2>
              <p className="text-[15px]">{interests.join(', ')}</p>
            </section>
          </div>
        </div>
      </main>

      <footer className={`${container} pb-10 print:hidden`}>
        <p className="pt-8 border-t border-border text-center text-sm text-muted flex items-center justify-center gap-1">
          {' Built with '}
          <a href="https://react.dev" className="hover:underline">
            React
          </a>
          {' | hosted on '}
          <img src={awsLogo} alt="AWS" className="w-5 h-5 invert-60" />
        </p>
      </footer>
    </div>
  );
}
