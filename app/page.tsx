import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-omniwallet-primary via-omniwallet-secondary to-omniwallet-accent">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Omniwallet</h1>
          <p className="text-2xl mb-8">Portal de Partners</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/admin"
              className="bg-white text-omniwallet-primary px-6 py-3 rounded-lg font-semibold hover:bg-omniwallet-light transition"
            >
              Dashboard Admin
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
