import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';

const flowOptions = [
  {
    id: 'member',
    title: 'Join as a Community Member',
    description: 'Create your account to follow content, buy event tickets, join the newsletter, and access the TribeDala community.',
    icon: 'ri-user-heart-line',
  },
  {
    id: 'creator',
    title: 'Apply as a Creator',
    description: 'Create an account first, then apply as a verified creator: podcaster, DJ, MC, videographer, blogger, photographer, or dancer.',
    icon: 'ri-user-star-line',
  },
  {
    id: 'appearance',
    title: 'Request to Be on a Show',
    description: 'Only signed-in community members can submit a pitch to be on the Podcast, Interview, or Girlies.',
    icon: 'ri-mic-line',
  },
  {
    id: 'services',
    title: 'Request Marketing Services',
    description: 'Members with an account can request content creation, social media support, or campaign help for admin review.',
    icon: 'ri-briefcase-line',
  },
  {
    id: 'hosting',
    title: 'Request Event Hosting',
    description: 'Create or log in to request event hosting, production, or MC support and let admin see who submitted it.',
    icon: 'ri-calendar-event-line',
  },
  {
    id: 'organizer',
    title: 'Become an Event Organizer',
    description: 'Signed-in users can apply to list and sell tickets for events through the TribeDala platform.',
    icon: 'ri-ticket-line',
  },
  {
    id: 'collaboration',
    title: 'Propose a Collaboration',
    description: 'Create an account, then pitch your idea for a creative partnership and keep it tied to your profile.',
    icon: 'ri-hand-heart-line',
  },
];

const creatorCategories = [
  { value: 'podcaster', label: 'Podcaster' },
  { value: 'dj', label: 'DJ' },
  { value: 'mc', label: 'MC / Host' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'blogger', label: 'Blogger / Writer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'dancer', label: 'Dancer' },
  { value: 'other', label: 'Other' },
];

const showOptions = [
  { value: 'podcast', label: 'Tribe Dala Podcast' },
  { value: 'interview', label: 'Tribe Dala Interview' },
  { value: 'girlies', label: 'Tribe Dala Girlies' },
];

export default function GetInvolvedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'podcaster',
    show: 'podcast',
    topic: '',
    details: '',
    budget: '',
    timeline: '',
    portfolio: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectFlow = (flowId: string) => {
    if (!user) {
      setErrorMessage('Create an account before submitting a request so admin can see who submitted it.');
      navigate('/signup');
      return;
    }

    setErrorMessage('');
    setSelectedFlow(flowId);
    setStep(1);
    setSubmitted(false);
  };

  const handleNext = () => {
    setErrorMessage('');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrorMessage('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('Please sign in first so your request is linked to your community account and visible to admin.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      if (selectedFlow === 'creator') {
        const { error } = await supabase.from('creator_applications').insert({
          user_id: user.id,
          role_requested: 'Creator',
          category: formData.category,
          portfolio_url: formData.portfolio,
          reason: formData.details,
          status: 'pending',
          review_notes: '',
        });

        if (error) throw error;
      } else if (selectedFlow === 'organizer') {
        const { error } = await supabase.from('creator_applications').insert({
          user_id: user.id,
          role_requested: 'Organizer',
          category: 'event_organizer',
          portfolio_url: formData.portfolio,
          reason: formData.details,
          status: 'pending',
          review_notes: '',
        });

        if (error) throw error;
      } else if (selectedFlow && ['appearance', 'services', 'hosting', 'collaboration'].includes(selectedFlow)) {
        const serviceTypeMap: Record<string, string> = {
          appearance: 'show_appearance',
          services: 'marketing_services',
          hosting: 'event_hosting',
          collaboration: 'collaboration',
        };

        const detailsParts = [
          `Name: ${formData.name}`,
          `Email: ${formData.email}`,
          formData.phone ? `Phone: ${formData.phone}` : null,
          selectedFlow === 'appearance' ? `Show: ${formData.show}` : null,
          selectedFlow === 'appearance' && formData.topic ? `Topic: ${formData.topic}` : null,
          formData.details ? `Details: ${formData.details}` : null,
          selectedFlow === 'services' && formData.budget ? `Budget: ${formData.budget}` : null,
          formData.timeline ? `Timeline: ${formData.timeline}` : null,
        ].filter(Boolean);

        const { error } = await supabase.from('service_requests').insert({
          user_id: user.id,
          service_type: serviceTypeMap[selectedFlow],
          contact_email: formData.email,
          details: detailsParts.join('\n'),
          budget_range: selectedFlow === 'services' ? formData.budget : '',
          timeline: formData.timeline,
          status: 'pending',
        });

        if (error) throw error;
      }

      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Your request could not be sent. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFlow(null);
    setStep(1);
    setSubmitted(false);
    setErrorMessage('');
    setFormData({
      name: '', email: '', phone: '', category: 'podcaster',
      show: 'podcast', topic: '', details: '', budget: '', timeline: '', portfolio: '',
    });
  };

  const flowLabel = flowOptions.find((f) => f.id === selectedFlow)?.title || '';

  return (
    <div className="min-h-screen bg-background-50 pt-14 md:pt-20">
      <section className="section-padding py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-heading text-2xl md:text-4xl text-foreground-50">Get Involved</h1>
          <p className="text-sm md:text-base text-foreground-400 mt-4 leading-relaxed">
            Create an account to join the community and request any of the opportunities below. Requests are tied to your profile so admin can see who submitted them.
          </p>
        </div>
      </section>

      <section className="section-padding pb-20">
        {!selectedFlow && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {flowOptions.map((flow) => (
              <button
                key={flow.id}
                onClick={() => handleSelectFlow(flow.id)}
                className="card p-5 text-left hover:border-primary-500/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-md bg-primary-500/15 text-primary-400 flex items-center justify-center mb-3 group-hover:bg-primary-500/25 transition-colors">
                  <i className={`${flow.icon} text-lg`} />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-1.5">{flow.title}</h3>
                <p className="text-xs text-foreground-500 leading-relaxed">{flow.description}</p>
              </button>
            ))}
          </div>
        )}

        {selectedFlow && !submitted && (
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={handleReset} className="w-8 h-8 rounded-md flex items-center justify-center text-foreground-500 hover:text-foreground-200 transition-colors">
                <i className="ri-arrow-left-line" />
              </button>
              <div>
                <h2 className="font-heading text-lg text-foreground-50">{flowLabel}</h2>
                <p className="text-xs text-foreground-500">Step {step} of {selectedFlow === 'member' ? 1 : selectedFlow === 'organizer' || selectedFlow === 'creator' ? 3 : 2}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8">
              {Array.from({ length: selectedFlow === 'member' ? 1 : selectedFlow === 'organizer' || selectedFlow === 'creator' ? 3 : 2 }).map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${step > i ? 'bg-primary-500' : 'bg-background-300'}`} />
              ))}
            </div>

            <div className="card p-6 space-y-5">
              {errorMessage && (
                <div className="rounded-md border border-accent-500/30 bg-accent-500/10 p-3 text-sm text-accent-400">
                  {errorMessage}
                </div>
              )}

              {step === 1 && (
                <>
                  <div>
                    <label htmlFor="gi-name" className="block text-sm font-medium text-foreground-200 mb-1.5">Full Name</label>
                    <input id="gi-name" type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="gi-email" className="block text-sm font-medium text-foreground-200 mb-1.5">Email</label>
                    <input id="gi-email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="you@email.com" />
                  </div>
                  <div>
                    <label htmlFor="gi-phone" className="block text-sm font-medium text-foreground-200 mb-1.5">Phone (optional)</label>
                    <input id="gi-phone" type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="+254 7XX XXX XXX" />
                  </div>
                  {selectedFlow === 'creator' && (
                    <div>
                      <label htmlFor="gi-category" className="block text-sm font-medium text-foreground-200 mb-1.5">Creator Category</label>
                      <select id="gi-category" value={formData.category} onChange={(e) => updateField('category', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500">
                        {creatorCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  )}
                  {selectedFlow === 'appearance' && (
                    <div>
                      <label htmlFor="gi-show" className="block text-sm font-medium text-foreground-200 mb-1.5">Which show?</label>
                      <select id="gi-show" value={formData.show} onChange={(e) => updateField('show', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500">
                        {showOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  {(selectedFlow === 'creator' || selectedFlow === 'organizer') && (
                    <div>
                      <label htmlFor="gi-portfolio" className="block text-sm font-medium text-foreground-200 mb-1.5">Portfolio / Website Link</label>
                      <input id="gi-portfolio" type="url" value={formData.portfolio} onChange={(e) => updateField('portfolio', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="https://..." />
                    </div>
                  )}
                  {selectedFlow === 'appearance' && (
                    <div>
                      <label htmlFor="gi-topic" className="block text-sm font-medium text-foreground-200 mb-1.5">What would you like to discuss?</label>
                      <textarea id="gi-topic" value={formData.topic} onChange={(e) => updateField('topic', e.target.value)} rows={3} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none" placeholder="Share your idea..." />
                    </div>
                  )}
                  <div>
                    <label htmlFor="gi-details" className="block text-sm font-medium text-foreground-200 mb-1.5">Tell us more</label>
                    <textarea id="gi-details" value={formData.details} onChange={(e) => updateField('details', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none" placeholder="Share your background, experience, or what you're looking for..." />
                  </div>
                  {selectedFlow === 'services' && (
                    <div>
                      <label htmlFor="gi-budget" className="block text-sm font-medium text-foreground-200 mb-1.5">Budget Range</label>
                      <select id="gi-budget" value={formData.budget} onChange={(e) => updateField('budget', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500">
                        <option value="">Select range...</option>
                        <option value="under-10k">Under KSh 10,000</option>
                        <option value="10k-50k">KSh 10,000 — 50,000</option>
                        <option value="50k-200k">KSh 50,000 — 200,000</option>
                        <option value="200k-plus">KSh 200,000+</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {(step === 3 && (selectedFlow === 'creator' || selectedFlow === 'organizer')) && (
                <div>
                  <label htmlFor="gi-timeline" className="block text-sm font-medium text-foreground-200 mb-1.5">Timeline / Availability</label>
                  <input id="gi-timeline" type="text" value={formData.timeline} onChange={(e) => updateField('timeline', e.target.value)} className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" placeholder="e.g., Available starting September 2026" />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <button type="button" onClick={handleBack} className="btn-secondary flex-1 text-sm">Back</button>
                )}
                {((selectedFlow === 'member' && step === 1) ||
                  ((selectedFlow === 'appearance' || selectedFlow === 'services' || selectedFlow === 'hosting' || selectedFlow === 'collaboration') && step === 2) ||
                  ((selectedFlow === 'creator' || selectedFlow === 'organizer') && step === 3)) ? (
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 text-sm disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit'}</button>
                ) : (
                  <button type="button" onClick={handleNext} className="btn-primary flex-1 text-sm">Continue</button>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedFlow && submitted && (
          <div className="max-w-md mx-auto text-center card p-8">
            <div className="w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center mx-auto mb-5">
              <i className="ri-checkbox-circle-line text-3xl text-primary-500" />
            </div>
            <h2 className="font-heading text-2xl text-foreground-50 mb-3">Request Submitted</h2>
            <p className="text-sm text-foreground-400 leading-relaxed mb-6">
              Your request has been sent to the TribeDala admin team. We will review it and confirm with you through your email.
            </p>
            <button type="button" onClick={handleReset} className="btn-primary text-sm">
              Send Another Request
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

