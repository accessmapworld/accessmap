import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ReviewForm from '../components/ReviewForm'

export default function SubmitReview() {
  const nav = useNavigate()
  return (
    <Layout>
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-3xl">Submit a review</h1>
        <p className="mt-1 text-muted">Rate accessibility across mobility, sensory, hearing and vision.</p>
        <div className="card mt-6 p-6">
          <ReviewForm onDone={() => nav(-1)} />
        </div>
      </div>
    </Layout>
  )
}
