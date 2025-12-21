import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Users, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Rocket,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-red-600 pb-1">ThinkTap</div>
          <div className="hidden md:flex gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            🎓 Built for Universities
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-500 text-transparent bg-clip-text leading-tight pb-2">
            Transform Your Classroom<br />with Real-Time Engagement
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ThinkTap makes interactive learning seamless with real-time quizzes, instant feedback, 
            and powerful analytics for lecturers and students.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✓ No credit card required • ✓ Set up in 2 minutes • ✓ Free forever
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need for Engagement</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for modern classroom environments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-red-600">
                  <Zap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Interaction</h3>
                <p className="text-gray-600">
                  Run live quizzes with Rush, Thinking, and Seminar modes. Students answer in real-time from any device.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-orange-600">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Versatile Question Formats</h3>
                <p className="text-gray-600">
                  Multiple choice, true/false, multiple select, short and long answer questions. All in one platform.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-green-600">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Actionable Insights</h3>
                <p className="text-gray-600">
                  View response rates, correctness percentages, and student engagement with beautiful charts and graphs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-orange-600">
                  <Smartphone className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Works Everywhere</h3>
                <p className="text-gray-600">
                  Web and mobile apps for lecturers and students. Join sessions with a simple 6-digit code.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-pink-600">
                  <Shield className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy-First Learning</h3>
                <p className="text-gray-600">
                  Seminar mode enables anonymous responses for sensitive topics and open discussions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 text-cyan-600">
                  <Rocket className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                <p className="text-gray-600">
                  Create and launch sessions in seconds. Students join instantly with no account required.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Session</h3>
              <p className="text-gray-600">
                Choose your question mode and create questions in seconds
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Students Join</h3>
              <p className="text-gray-600">
                Share the 6-digit code. Students join from any device instantly
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Engage & Analyze</h3>
              <p className="text-gray-600">
                Run live questions, see real-time responses, and review insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Freemium Plan */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Freemium</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">RM0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Unlimited live sessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All question types</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All 3 modes</span>
                  </li>
                  <li className="flex items-start text-gray-400">
                    <span className="mr-2">✗</span>
                    <span>No history save</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/register">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-red-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-red-600">Most Popular</Badge>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">ThinkTap Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">RM20</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Full history</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Export results</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/register">Subscribe</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Faculty Plan */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Faculty Plan</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">RM1K</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Multiple users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Shared resources</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Custom branding</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </CardContent>
            </Card>

            {/* University License */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">University</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Everything in Faculty</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Unlimited users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>LMS integration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>On-premise option</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of lecturers already using ThinkTap
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm mt-4 opacity-75">
            No credit card required • Set up in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">ThinkTap</h3>
              <p className="text-sm">
                Interactive classroom engagement platform built for universities.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <p className="text-sm">support@thinktap.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 ThinkTap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
