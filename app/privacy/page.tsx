import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the FlowPaste Privacy Policy.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'FlowPaste Privacy Policy',
    description: 'Read the FlowPaste Privacy Policy.',
    url: '/privacy',
    type: 'article',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-bold">FlowPaste</span>
          </Link>
          <Link href="/auth/sign-up" className="text-sm text-accent hover:underline">
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="space-y-6">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Effective date: May 30, 2026</p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect account information (name, email), content you upload, and essential usage data required to operate the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. How We Use Information</h2>
            <p className="text-muted-foreground">
              We use your data to provide features such as paste creation, sharing, authentication, analytics, and AI tooling.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. AI Processing</h2>
            <p className="text-muted-foreground">
              If you use AI features, selected content may be sent to configured third-party model providers (for example OpenRouter) to generate responses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain data as needed to provide the service or until you delete your content or account, subject to legal obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">5. Security</h2>
            <p className="text-muted-foreground">
              We apply reasonable safeguards to protect data, but no method of transmission or storage is 100% secure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You may request access, correction, or deletion of your personal data by contacting us.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">7. Changes to this Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy. Continued use of FlowPaste after updates means you accept the revised policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p className="text-muted-foreground">
              Privacy questions can be sent to <a href="mailto:privacy@raytech.cloud" className="text-accent hover:underline">privacy@raytech.cloud</a>.
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
