import { Fragment } from 'react'
import awsLogo from './assets/aws.svg'

const name = 'Bence Molnár';
const location = 'London, UK';
const email = 'hiring@molnarbence.dev';
const github = { handle: 'molnarbence', url: 'https://github.com/molnarbence' };
const githubOrg = { handle: 'mb-dot-dev', url: 'https://github.com/mb-dot-dev' };
const summary = `boyscout, amateur drone photographer, interested in astronomy, gastronomy and home automation`;
export const skills = ['.NET (C#)', 'Python', 'Node.js', 'Apache Spark', 'AWS', 'GitHub Actions'];

// Experience with multiple projects per company (no bullets)
export const experiences = [
  {
    company: 'Skyscanner Ltd',
    period: '2019 — 2026',
    location: 'London, UK',
    projects: [
      {
        name: 'SOx scoped database monitoring',
        description:
          'Led the development of a comprehensive monitoring solution to maintain SOx compliance, ' +
          'and provide a streamlined auditing solution for the external auditors.',
        tech: ['Python', 'AWS Batch', 'AWS CloudWatch', 'AWS Firehose'],
      },
      {
        name: 'Bespoke Financial Tools',
        description:
          'Led the development of the internal financial tools, responsible for staging the billing requests to the finance team, ' +
          'and providing insurance coverage for the open invoices. Furthermore, loading the exchange rates into the ERP and the Treasury system.',
        tech: ['C#', 'Python', 'TypeScript', '.NET', 'Kubernetes', 'AWS', 'Node.js', 'SQL Server', 'Postgres', 'MySQL'],
      },
      {
        name: 'SOx control ownership',
        description:
          'Being the SOx control owner of the financial tooling Financial and IT controls; documenting SOx control evidence provision and conducting annual audit of the bespoke financial tools of Skyscanner.',
      },
      {
        name: 'Disaster Recovery Plan for the Financial Tools',
        description:
          'Established and documented the runbook for a disaster event of Financial Tools including their databases.',
        tech: ['AWS CloudFormation', 'SQL Server', 'Postgres', 'MySQL'],
      },
      {
        name: 'Python application configuration facility',
        description:
          'Developed an internal python package to unify developer experience to load application configuration from various sources, including the internal secret vault solution, reducing the code complexity of the AWS Batch jobs and AWS Lambda functions written in python.',
        tech: ['Python'],
      },
    ],
  },
  {
    company: 'Mimecast',
    period: '2017 — 2019',
    location: 'London, UK',
    projects: [
      {
        name: 'Email ingestion system',
        description:
          'Worked on the email ingestion system that helped onboarding new customers and migrate their emails to Mimecast.',
        tech: ['.NET', 'C#'],
      },
    ],
  },
  {
    company: 'Agoda',
    period: '2014 — 2017',
    location: 'Bangkok, Thailand',
    projects: [
      {
        name: 'PIX Image Platform',
        description:
          "I've organized the handover of the PIX Image Platform from the Budapest development team bringing the platform's development to the Bangkok HQ and further improved the main service by " +
          'migrating the service to cross platform .NET Core 2.0, and distributed the workload of image upload using Kafka messaging.',
        tech: ['.NET', 'C#', 'Kafka', 'Cassandra'],
      },
      {
        name: 'Experimentation Platform',
        description:
          "I worked mainly on the Experimentation Platform's user interface, used by Product Owners managing setup of their A/B test runs.",
        tech: ['TypeScript', 'AngularJS'],
      },
      {
        name: 'Agoda Home Page',
        description:
          'One of my first assignment included delivering the new search box oriented, responsive UI layout in 2014 August, gaining +7% revenue with a single AB test.',
        tech: ['ASP.NET', 'C#', 'JavaScript'],
      },
    ],
  },
  {
    company: 'NK Services',
    period: '2010 — 2014',
    location: 'Budapest, Hungary',
    projects: [
      {
        name: 'VodaMail Web Management - Vodafone Hungary',
        description:
          'Developed and maintained the management portal for the public email service of Vodafone Hungary offered to their mobile customers.',
        tech: ['ASP.NET', 'C#', 'JavaScript', 'SQL Server'],
      },
    ],
  },
];

export const education = [
  {
    school: 'Budapest University of Technology and Economics',
    degree: 'Software Engineer BSc',
    period: '2007 — 2009',
  },
];

export default function App() {
  return (
    <div className="mx-auto max-w-5xl lg:max-w-6xl px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-8">
      <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 shadow-sm p-6 sm:p-8 lg:p-10 xl:p-12">
        <main className="space-y-10">
          {/* Header */}
          <header className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{name}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1 justify-center">
              <span className="inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span>{location}</span>
              </span>
              <span>•</span>
              <a href={`mailto:${email}`} className="hover:underline inline-flex items-center gap-1 transition-colors duration-150 hover:text-blue-700 dark:hover:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 7.5l-8.486 5.657a3 3 0 01-3.528 0L1.25 7.5m20.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75h15a2.25 2.25 0 002.25-2.25v-9z" /></svg>
                <span>{email}</span>
              </a>
              <span>•</span>
              <a href={github.url} target="_blank" rel="noopener" className="hover:underline inline-flex items-center gap-1 transition-colors duration-150 hover:text-blue-700 dark:hover:text-blue-300" aria-label="GitHub profile">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.35-1.087.636-1.337-2.221-.253-4.555-1.112-4.555-4.948 0-1.092.39-1.986 1.029-2.685-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.685 0 3.845-2.337 4.692-4.566 4.94.359.31.678.922.678 1.859 0 1.342-.012 2.424-.012 2.754 0 .268.18.58.688.481A10.004 10.004 0 0 0 22 12c0-5.523-4.477-10-10-10Z" clipRule="evenodd" /></svg>
                <span>{`/${github.handle}`}</span>
              </a>
              <span>•</span>
              <a href={githubOrg.url} target="_blank" rel="noopener" className="hover:underline inline-flex items-center gap-1 transition-colors duration-150 hover:text-blue-700 dark:hover:text-blue-300" aria-label="GitHub organisation">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.35-1.087.636-1.337-2.221-.253-4.555-1.112-4.555-4.948 0-1.092.39-1.986 1.029-2.685-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.685 0 3.845-2.337 4.692-4.566 4.94.359.31.678.922.678 1.859 0 1.342-.012 2.424-.012 2.754 0 .268.18.58.688.481A10.004 10.004 0 0 0 22 12c0-5.523-4.477-10-10-10Z" clipRule="evenodd" /></svg>
                <span>{`/${githubOrg.handle}`}</span>
              </a>
            </div>
          </header>

          {/* Summary */}
          <section className="space-y-3 text-center">
            <p className="mx-auto max-w-3xl lg:max-w-4xl text-gray-700 dark:text-gray-300">{summary}</p>
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Experience</h2>
            <div className="relative grid grid-cols-[1fr_5rem] gap-x-6 gap-y-12">
              {/* Right-hand vertical timeline line spanning all rows */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true"></div>
              {experiences.map((exp, i) => (
                <Fragment key={i}>
                  {/* Left column: content */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <div className="font-medium">
                        <span className="text-gray-700 dark:text-gray-200">{exp.company}</span>
                        <span className="text-gray-500 dark:text-gray-400">{` · ${exp.location}`}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {exp.projects.map((p, j) => (
                        <div key={j}>
                          <div className="font-medium">{p.name}</div>
                          <p className="text-gray-700 dark:text-gray-300">{p.description}</p>
                          {'tech' in p && p.tech?.length ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              {p.tech.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right column: timeline cell for this row */}
                  <div className="relative pr-6">
                    <span
                      className="absolute right-0 top-2.5 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 ring-2 ring-white dark:ring-neutral-900 translate-x-1/2"
                      aria-hidden="true"
                    ></span>
                    <span className="absolute right-4 top-1 text-xs text-gray-400 dark:text-gray-500 select-none">{exp.period}</span>
                  </div>
                </Fragment>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Skills</h2>
            <ul className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <li key={i} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* Education */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Education</h2>
            <ul className="space-y-2">
              {education.map((e, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div className="font-medium">
                    {`${e.degree} — `}
                    <span className="text-gray-700 dark:text-gray-200">{e.school}</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{e.period}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Footer */}
          <footer className="pt-8 mt-10 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              {' Built with '}
              <a href="https://react.dev" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150">
                React
              </a>
              {' | hosted on '}
              <img src={awsLogo} alt="AWS" className="w-5 h-5" style={{ filter: 'invert(60%)' }} />
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
