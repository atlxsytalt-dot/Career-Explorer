import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Zap } from "lucide-react";

export default function TOS() {
  return (
    <div className="min-h-[100dvh] bg-background grid-bg">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 rounded-xl font-bold text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground font-medium">Effective: 1 January 2026 · Career Explorer by Hamed · UAE</p>
          </div>
        </div>

        <div className="space-y-8 text-foreground/90">

          <section className="bg-card border border-border rounded-2xl p-6 neon-border">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-primary">1. Acceptance of Terms</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Career Explorer ("the Service"), you agree to be bound by these Terms of Service ("Terms").
              Career Explorer is operated by Hamed exclusively for students and staff of Wales International British School, United Arab Emirates.
              If you do not agree to these Terms, you must not use the Service. We reserve the right to update these Terms at any time —
              continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-secondary mb-3">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Career Explorer is intended for use by students enrolled at Wales International British School (UAE) and authorised school staff only.
              By creating an account, you confirm that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You are a current student or staff member of Wales International British School, UAE</li>
              <li>You are at least 10 years old, or have parental / guardian consent as required under UAE law</li>
              <li>You will use the platform only for your educational career exploration</li>
              <li>All information you provide is accurate and truthful</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-accent mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You are responsible for maintaining the security of your account and password. Career Explorer is not liable for
              any loss or damage arising from unauthorised use of your account. You must not share your login credentials with
              anyone. Each student must create and use only one personal account.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Accounts can be created using a Google account or a verified email address. Accounts using school email addresses
              (<strong className="text-foreground">@walesschool.com</strong>) are given priority access.
              If you forget your password, you can reset it from the sign-in page using the "Forgot password?" option.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-primary mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use the Service for any unlawful, harmful, or fraudulent purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
              <li>Impersonate any person, school, or organisation</li>
              <li>Post, upload, or share any content that is offensive, discriminatory, sexually explicit, or violent</li>
              <li>Harass, bully, or threaten other users of the platform</li>
              <li>Use automated scripts, bots, or scrapers to access the Service</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Reverse engineer, decompile, or otherwise attempt to extract the source code of the Service</li>
              <li>Create multiple accounts or attempt to evade an account ban</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-secondary mb-3">5. Content & Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              All content on Career Explorer — including career roadmaps, challenge questions, design, branding, and code —
              is the intellectual property of the creator (Hamed) and Wales International British School. You may not reproduce, distribute, modify,
              or create derivative works from any content without express written permission.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Career information is provided for educational purposes only and does not constitute professional career advice.
              We make no guarantees about the accuracy or completeness of career pathway information.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-accent mb-3">6. Privacy & Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect only the information needed to operate the Service: your display name, grade, email address
              (via Clerk authentication), and your career progress data. We do not sell your personal data to third parties.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Authentication is handled securely by <strong className="text-foreground">Clerk</strong>, a trusted identity provider</li>
              <li>Career progress data is stored in a secure PostgreSQL database</li>
              <li>Admin users can view account information for school moderation purposes only</li>
              <li>You can request deletion of your data by contacting the school administrator</li>
              <li>We comply with applicable UAE Federal data protection laws, including the UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-primary mb-3">7. Admin Powers & Enforcement</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              School administrators and authorised staff have the ability to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>View all user accounts and email addresses for moderation purposes</li>
              <li>Temporarily or permanently ban accounts that violate these Terms</li>
              <li>Delete accounts that seriously violate these Terms</li>
              <li>Assign roles and titles to users</li>
              <li>Send platform-wide announcements to all users</li>
              <li>Remove or modify any user-generated content</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Banned users will be notified and may appeal by contacting the school directly. Serious violations
              may be escalated to school leadership and, where required by UAE law, to relevant authorities.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-secondary mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Career Explorer is provided "as is" without warranties of any kind. The Service is a student project built for
              educational purposes at Wales International British School, UAE. To the maximum extent permitted by UAE law, Hamed and Wales International British School are not
              liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
              Career information is for guidance only — always seek professional advice for important career decisions.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-accent mb-3">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or permanently terminate your access to Career Explorer at any time, with or
              without notice, if we believe you have violated these Terms or for any other reason at our sole discretion.
              Upon termination, your right to use the Service immediately ceases.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-primary mb-3">10. Changes to the Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Career Explorer may update, modify, or discontinue any aspect of the Service at any time without notice.
              We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-secondary mb-3">11. Governing Law — United Arab Emirates</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              These Terms are governed by and construed in accordance with the laws of the United Arab Emirates, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>UAE Federal Law No. 5 of 2012 on Combating Cybercrimes</li>
              <li>UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)</li>
              <li>UAE Federal Law No. 15 of 1980 on Press and Publications (as applicable)</li>
              <li>The laws of the Emirate of Abu Dhabi / Dubai (as applicable to the school's location)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the
              courts of the United Arab Emirates.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-accent mb-3">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms, please contact the school administration or reach out to the platform
              creator through Wales International British School's official channels. The administrator email is{" "}
              <strong className="text-primary">002159@walesschool.com</strong>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm font-medium">
            © 2026 Career Explorer · Made by Hamed for Wales International British School, UAE · All rights reserved
          </p>
          <Link href="/">
            <Button className="mt-4 rounded-xl font-bold" variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
