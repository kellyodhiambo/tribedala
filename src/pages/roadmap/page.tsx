import { useState } from 'react';
import { ChevronDown, Check, AlertCircle, X, Zap } from 'lucide-react';

export default function RoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase1');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const criticalIssues = [
    {
      id: 'auth',
      title: 'Auth Flow Broken',
      severity: 'critical',
      description: 'Login fails with "Failed to fetch" error',
      rootCause: 'RLS policies causing infinite recursion on user queries',
      timeToFix: '15 min',
      impact: '🔴 Blocks ALL access to app',
      fix: 'Run IMMEDIATE_FIXES.sql in Supabase SQL Editor',
    },
    {
      id: 'profile',
      title: 'Profile Save Handler Empty',
      severity: 'high',
      description: 'Profile form validates but doesn\'t save',
      rootCause: 'handleSave() function is empty',
      timeToFix: '15 min',
      impact: '⚠️ Users can\'t update profiles',
      fix: 'Complete the handleSave function in src/pages/dashboard/profile/page.tsx',
    },
    {
      id: 'contact',
      title: 'Contact Form Not Saved',
      severity: 'high',
      description: 'Contact form validates but doesn\'t save anywhere',
      rootCause: 'No database submission call',
      timeToFix: '20 min',
      impact: '⚠️ No lead capture',
      fix: 'Add supabase.from("inquiries").insert() call',
    },
    {
      id: 'content',
      title: 'Admin Content Query Wrong',
      severity: 'high',
      description: 'Queries non-existent "content" table',
      rootCause: 'Wrong table name in query',
      timeToFix: '10 min',
      impact: '⚠️ Admin can\'t manage content',
      fix: 'Change query to use episodes + blog_posts tables',
    },
  ];

  const phases = [
    {
      id: 'phase1',
      name: 'Critical Fixes',
      duration: '5 hours',
      timeframe: 'Week 1-2',
      color: 'from-red-500 to-red-600',
      tasks: [
        { name: 'Fix RLS policies (infinite recursion)', done: false, time: '2-3h' },
        { name: 'Complete contact form DB integration', done: false, time: '1-2h' },
        { name: 'Complete dashboard profile save handler', done: false, time: '1h' },
        { name: 'Fix admin content management query', done: false, time: '1h' },
      ],
    },
    {
      id: 'phase2',
      name: 'Payment Integration',
      duration: '18 hours',
      timeframe: 'Week 3-4',
      color: 'from-yellow-500 to-orange-600',
      tasks: [
        { name: 'M-Pesa Daraja account setup', done: false, time: '1h' },
        { name: 'Create payments + tickets tables', done: false, time: '2h' },
        { name: 'Implement STK push integration', done: false, time: '5h' },
        { name: 'Add QR code generation', done: false, time: '3h' },
        { name: 'Setup email delivery', done: false, time: '4h' },
        { name: 'End-to-end testing', done: false, time: '3h' },
      ],
    },
    {
      id: 'phase3',
      name: 'SEO Optimization',
      duration: '12 hours',
      timeframe: 'Week 5',
      color: 'from-purple-500 to-pink-600',
      tasks: [
        { name: 'Add dynamic meta tags', done: false, time: '3h' },
        { name: 'Create sitemap generator', done: false, time: '2h' },
        { name: 'Add structured data (schema.org)', done: false, time: '4h' },
        { name: 'Create robots.txt', done: false, time: '1h' },
        { name: 'Test with Google Search Console', done: false, time: '2h' },
      ],
    },
    {
      id: 'phase4',
      name: 'Feature Completeness',
      duration: '17 hours',
      timeframe: 'Week 6-7',
      color: 'from-green-500 to-emerald-600',
      tasks: [
        { name: 'Real-time notifications (Supabase subscriptions)', done: false, time: '2h' },
        { name: 'Blog comments display + submission', done: false, time: '3h' },
        { name: 'Audio/video file uploads', done: false, time: '4h' },
        { name: 'Podcast/video player integration', done: false, time: '3h' },
        { name: 'Chat system (basic)', done: false, time: '5h' },
      ],
    },
    {
      id: 'phase5',
      name: 'Security & Performance',
      duration: '11 hours',
      timeframe: 'Week 8',
      color: 'from-blue-500 to-cyan-600',
      tasks: [
        { name: 'Fix RLS policies (proper implementation)', done: false, time: '3h' },
        { name: 'Add error boundaries', done: false, time: '2h' },
        { name: 'Server-side validation', done: false, time: '3h' },
        { name: 'Performance optimization', done: false, time: '3h' },
      ],
    },
    {
      id: 'phase6',
      name: 'Analytics & Monitoring',
      duration: '6 hours',
      timeframe: 'Week 9',
      color: 'from-indigo-500 to-purple-600',
      tasks: [
        { name: 'Google Analytics integration', done: false, time: '2h' },
        { name: 'Admin analytics dashboard', done: false, time: '4h' },
      ],
    },
  ];

  const features = [
    { category: 'Authentication', status: 'broken', items: ['Supabase Auth', 'OAuth (Google/Apple)', 'Role-based access'] },
    { category: 'Database', status: 'complete', items: ['15 normalized tables', 'User profiles', 'Blog system', 'Events'] },
    { category: 'Blog', status: 'complete', items: ['Create/read posts', 'Categorize', 'Slug-based routing'] },
    { category: 'Events', status: 'partial', items: ['Create/list/detail', 'Ticket tiers', 'No payment yet'] },
    { category: 'Creators', status: 'complete', items: ['Directory', 'Verification', 'Applications'] },
    { category: 'Admin Panel', status: 'partial', items: ['User management', 'Content (broken)', 'Applications review'] },
    { category: 'Payments', status: 'missing', items: ['No M-Pesa', 'No Stripe', 'No tickets'] },
    { category: 'SEO', status: 'minimal', items: ['No meta tags', 'No sitemap', 'No schema.org'] },
    { category: 'Real-time', status: 'missing', items: ['No subscriptions', 'No notifications', 'No chat'] },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 text-green-700 border-green-200';
      case 'partial':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'broken':
        return 'bg-red-500/20 text-red-700 border-red-200';
      case 'missing':
        return 'bg-gray-500/20 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <Check className="w-4 h-4" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4" />;
      case 'broken':
        return <X className="w-4 h-4" />;
      default:
        return <X className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">TribeDala Project Audit</h1>
          <p className="text-lg text-accent-100">Complete Feature Analysis & Development Roadmap</p>
          <div className="mt-6 flex gap-8">
            <div>
              <p className="text-sm text-accent-200">Current Status</p>
              <p className="text-2xl font-bold">~60% Complete</p>
            </div>
            <div>
              <p className="text-sm text-accent-200">Est. Time to Launch</p>
              <p className="text-2xl font-bold">9 Weeks</p>
            </div>
            <div>
              <p className="text-sm text-accent-200">Total Effort</p>
              <p className="text-2xl font-bold">69 Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Critical Issues */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Zap className="w-8 h-8 text-red-500" />
            Critical Issues (Fix First)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {criticalIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-700/50 border border-red-500/30 rounded-lg p-6 cursor-pointer hover:bg-slate-700/70 transition"
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              >
                <div className="flex items-start gap-4 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{issue.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{issue.description}</p>
                  </div>
                  <span className="text-xs font-mono bg-red-500/20 text-red-300 px-3 py-1 rounded">
                    {issue.timeToFix}
                  </span>
                </div>

                {expandedIssue === issue.id && (
                  <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Root Cause</p>
                      <p className="text-sm text-slate-300 mt-1">{issue.rootCause}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Fix</p>
                      <p className="text-sm text-slate-300 mt-1">{issue.fix}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Impact</p>
                      <p className="text-sm text-slate-300 mt-1">{issue.impact}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Feature Status */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Feature Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${getStatusColor(feature.status)}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {getStatusIcon(feature.status)}
                  <h3 className="font-bold text-lg">{feature.category}</h3>
                </div>
                <ul className="space-y-2">
                  {feature.items.map((item, i) => (
                    <li key={i} className="text-sm opacity-80">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Development Phases */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Development Roadmap</h2>
          <div className="space-y-4">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="bg-slate-700/30 border border-slate-600 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-700/50 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-r ${phase.color} w-2 h-12 rounded`}></div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{phase.name}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-sm text-slate-400">{phase.duration}</span>
                        <span className="text-sm text-slate-400">{phase.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition transform ${
                      expandedPhase === phase.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedPhase === phase.id && (
                  <div className="bg-slate-800/50 border-t border-slate-600 p-6">
                    <div className="space-y-3">
                      {phase.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-600 text-accent-600"
                            defaultChecked={task.done}
                          />
                          <div className="flex-1">
                            <p className="text-slate-200">{task.name}</p>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{task.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Project Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Database Tables</p>
              <p className="text-2xl font-bold text-white mt-2">15/15 ✅</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Pages Built</p>
              <p className="text-2xl font-bold text-white mt-2">25+ 🏗️</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Features Done</p>
              <p className="text-2xl font-bold text-white mt-2">25 ✅</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Features Missing</p>
              <p className="text-2xl font-bold text-white mt-2">10 ❌</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Critical Issues</p>
              <p className="text-2xl font-bold text-white mt-2">4 🔴</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Launch Ready</p>
              <p className="text-2xl font-bold text-white mt-2">❌ Not Yet</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3">🚨 Immediate (Today)</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>✓ Run IMMEDIATE_FIXES.sql in Supabase</li>
                <li>✓ Fix auth RLS policies</li>
                <li>✓ Test login (amor@tribedala.com)</li>
                <li>✓ Fix profile save handler</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3">⚡ This Week</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>✓ Complete contact form DB</li>
                <li>✓ Fix admin content query</li>
                <li>✓ Complete dashboard features</li>
                <li>✓ Deploy MVP version</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3">📅 Next 2 Weeks</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>✓ Implement M-Pesa payments</li>
                <li>✓ Generate QR tickets</li>
                <li>✓ Setup email delivery</li>
                <li>✓ Enable revenue</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 border-t border-slate-700 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400">
          <p className="text-sm">
            TribeDala Creator Community Platform • Project Status: MVP Stage • Last Updated: August 28, 2026
          </p>
          <p className="text-xs mt-2">Admin: amor@tribedala.com | Supabase: prllmmcscqlsiezgaqrb</p>
        </div>
      </div>
    </div>
  );
}
