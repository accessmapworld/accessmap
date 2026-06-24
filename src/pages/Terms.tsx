import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const UPDATED = 'June 2026'
const ENTITY = 'AccessMap' // ← replace with your legal entity name if different
const JURISDICTION = 'your jurisdiction' // ← replace, e.g. "the State of California, USA"

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-semibold">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-muted">{children}</p>
}

export default function Terms() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <p className="label">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-1 text-sm text-muted">Last updated: {UPDATED}</p>

        <P>
          These Terms govern your use of the AccessMap website and services (the “Service”) provided by
          {' '}{ENTITY}. By accessing or using the Service, you agree to these Terms. If you don’t agree,
          please don’t use the Service.
        </P>

        <H>1. The Service</H>
        <P>
          AccessMap is a community platform for sharing accessibility information about places. It aggregates
          user contributions and third-party data (including OpenStreetMap) and provides maps, scores,
          alerts, and routing links.
        </P>

        <H>2. Accessibility information is not guaranteed</H>
        <P>
          Accessibility scores, terrain, alerts, routes, and other data are crowdsourced and drawn from
          third-party sources. They may be incomplete, outdated, or inaccurate. <strong>Always verify
          critical accessibility details directly with a venue before relying on them.</strong> The Service
          is provided for informational purposes only and is not a substitute for professional or official
          accessibility guidance.
        </P>

        <H>3. Accounts</H>
        <P>
          You are responsible for activity under your account and for keeping your login secure. You must
          provide accurate information and be at least 13 years old (or the age of digital consent in your
          region).
        </P>

        <H>4. Your content</H>
        <P>
          You retain ownership of reviews, photos, reports, and listings you submit (“User Content”). You
          grant {ENTITY} a worldwide, non-exclusive, royalty-free license to host, display, reproduce, and
          distribute your User Content to operate and promote the Service. You represent that you have the
          rights to your content and that it’s accurate and lawful.
        </P>

        <H>5. Acceptable use</H>
        <P>
          Don’t post false, misleading, defamatory, infringing, or unlawful content; don’t harass others,
          scrape or abuse the Service, attempt to break security, or misuse third-party APIs. We may remove
          content or suspend accounts that violate these Terms.
        </P>

        <H>6. Business listings</H>
        <P>
          Businesses may self-list and optionally feature (“sponsor”) their listing. You are responsible for
          the accuracy of your listing. Sponsorship affects placement, not the integrity of community ratings.
        </P>

        <H>7. Third-party services</H>
        <P>
          The Service relies on third parties (OpenStreetMap, Google/Firebase, Vercel, OSRM, Roboflow, and
          others). Their terms and privacy practices also apply. Map data © OpenStreetMap contributors (ODbL).
        </P>

        <H>8. Disclaimers</H>
        <P>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT.
        </P>

        <H>9. Limitation of liability</H>
        <P>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {ENTITY} WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, OR CONSEQUENTIAL DAMAGES, OR FOR ANY LOSS ARISING FROM YOUR RELIANCE ON ACCESSIBILITY
          INFORMATION OBTAINED THROUGH THE SERVICE.
        </P>

        <H>10. Changes &amp; termination</H>
        <P>
          We may modify or discontinue the Service or these Terms at any time. Continued use after changes
          means you accept the updated Terms. We may suspend or terminate access for violations.
        </P>

        <H>11. Governing law</H>
        <P>These Terms are governed by the laws of {JURISDICTION}, without regard to conflict-of-law rules.</P>

        <H>12. Contact</H>
        <P>Questions about these Terms? Use the Report feature in the app to get in touch with us.</P>

        <p className="mt-10 text-sm">
          <Link to="/privacy" className="text-primary">Privacy Policy</Link> ·{' '}
          <Link to="/" className="text-primary">Home</Link>
        </p>
      </div>
    </Layout>
  )
}
