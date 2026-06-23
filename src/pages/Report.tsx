import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ReportForm from '../components/ReportForm'

export default function Report() {
  const nav = useNavigate()
  return (
    <Layout>
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-3xl">Report an issue</h1>
        <p className="mt-1 text-muted">Flag a temporary accessibility problem so others know in real time.</p>
        <div className="card mt-6 p-6">
          <ReportForm onDone={() => nav(-1)} />
        </div>
      </div>
    </Layout>
  )
}
