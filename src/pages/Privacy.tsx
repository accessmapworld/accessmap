import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const UPDATED = 'June 2026'
const ENTITY = 'AccessMap' // ← replace with your legal entity name if different

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-semibold">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-muted">{children}</p>
}

export default function Privacy() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <p className="label">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted">Last updated: {UPDATED}</p>

        <P>
          This Privacy Policy explains how {ENTITY} (“we”, “us”) collects, uses, and shares information when
          you use the AccessMap website and services (the “Service”). By using the Service you agree to this
          policy.
        </P>

        <H>Information we collect</H>
        <P>
          <strong>Account information.</strong> If you sign in, we receive your name, email address, and
          profile photo from your chosen sign-in provider (e.g. Google) via Firebase Authentication.
        </P>
        <P>
          <strong>Content you submit.</strong> Reviews, accessibility ratings, issue reports, photos,
          business listings, and saved places. This content (other than your email) may be shown publicly
          alongside your display name.
        </P>
        <P>
          <strong>Location.</strong> With your permission, your device’s GPS location is used to center the
          map and find nearby places. If you decline, we may estimate your approximate area from your IP
          address. Precise location is processed in your browser and is not stored unless attached to
          content you choose to submit.
        </P>
        <P>
          <strong>Usage &amp; device data.</strong> Standard log and device information (browser type, pages
          viewed, approximate location) collected by our hosting and infrastructure providers.
        </P>
        <P>
          <strong>Local storage.</strong> We use your browser’s local/session storage to remember preferences
          and, in demo mode, to keep your contributions on your device.
        </P>

        <H>How we use information</H>
        <P>
          To operate and improve the Service, display community accessibility data, verify uploaded photos,
          show nearby places and routes, prevent abuse, and communicate with you about your account or
          contributions.
        </P>

        <H>How information is shared</H>
        <P>
          We share information with service providers that power the app, including: <strong>Google
          Firebase</strong> (authentication, database, file storage), <strong>Vercel</strong> (hosting),
          <strong> OpenStreetMap</strong> (map tiles and place data via Nominatim/Overpass),
          <strong> OSRM</strong> (routing), <strong>Google Maps</strong> (external directions links),
          <strong> Roboflow</strong> (AI photo verification), and an IP-geolocation provider. Public content
          you submit is visible to other users. We do not sell your personal information.
        </P>

        <H>Your choices &amp; rights</H>
        <P>
          You can deny or revoke location access in your browser settings, edit or delete your own reviews,
          and request deletion of your account and associated personal data by contacting us. Depending on
          your location, you may have rights to access, correct, or delete your data (e.g. under GDPR/CCPA).
        </P>

        <H>Data retention &amp; security</H>
        <P>
          We retain account and content data while your account is active or as needed to provide the
          Service. We use reasonable safeguards, but no method of transmission or storage is 100% secure.
        </P>

        <H>Children</H>
        <P>The Service is not directed to children under 13, and we do not knowingly collect their data.</P>

        <H>Changes</H>
        <P>We may update this policy; material changes will be reflected by the “Last updated” date above.</P>

        <H>Contact</H>
        <P>Questions or data requests? Use the Report feature in the app to get in touch with us.</P>

        <p className="mt-10 text-xs text-muted">
          Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).
        </p>
        <p className="mt-4 text-sm">
          <Link to="/terms" className="text-primary">Terms of Service</Link> ·{' '}
          <Link to="/" className="text-primary">Home</Link>
        </p>
      </div>
    </Layout>
  )
}
