import type { Metadata } from 'next'
import Link from 'next/link'
import { FlowPasteLogo } from '@/components/brand/flowpaste-logo'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the FlowPaste Terms of Service.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'FlowPaste Terms of Service',
    description: 'Read the FlowPaste Terms of Service.',
    url: '/terms',
    type: 'article',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlowPasteLogo className="h-8 w-8" priority />
            <span className="font-bold">FlowPaste</span>
          </Link>
          <Link href="/auth/sign-up" className="text-sm text-accent hover:underline">
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="space-y-6">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Effective date: May 30, 2026</p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By using FlowPaste, you agree to these Terms of Service and all applicable laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. Accounts and Access</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and for all activity under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You may not use FlowPaste to upload unlawful, abusive, malicious, or infringing content. We may remove content that violates these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4. Content Ownership</h2>
            <p className="text-muted-foreground">
              You retain ownership of the content you upload. You grant FlowPaste a limited license to host and display your content for service functionality.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">5. Service Availability</h2>
            <p className="text-muted-foreground">
              FlowPaste is provided on an &quot;as is&quot; basis without warranties. We may modify or discontinue parts of the service at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, FlowPaste and its operators are not liable for indirect or consequential damages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of FlowPaste after updates means you accept the revised terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p className="text-muted-foreground">
              For legal inquiries, contact us at <a href="mailto:legal@raytech.cloud" className="text-accent hover:underline">legal@raytech.cloud</a>.
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
