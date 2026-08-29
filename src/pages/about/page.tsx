export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background-50 pt-14 md:pt-20">
      {/* Hero */}
      <section className="relative h-[350px] md:h-[450px] overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Aerial%20view%20of%20Kisumu%20city%20at%20sunset%20with%20Lake%20Victoria%20in%20background%2C%20warm%20golden%20light%2C%20silhouettes%20of%20buildings%2C%20African%20urban%20landscape%2C%20cinematic%20wide%20shot%2C%20atmospheric%20haze%2C%20vibrant%20orange%20and%20amber%20sky&width=1600&height=800&seq=about-hero&orientation=landscape"
          alt="Kisumu City"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background-50" />
        <div className="absolute bottom-10 left-0 right-0 text-center px-4">
          <h1 className="font-heading text-2xl md:text-5xl text-background-50">About TribeDala</h1>
          <p className="text-sm md:text-lg text-foreground-200 max-w-2xl mx-auto mt-4">
            Born in Kisumu, built for creators everywhere.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-xl md:text-3xl text-foreground-50 mb-6">Our Mission</h2>
          <p className="text-sm md:text-base text-foreground-300 leading-relaxed">
            TribeDala exists to build, showcase, and empower the creative community in Kisumu and beyond.
            We believe that African creators deserve a platform that truly understands them — a space
            where podcasts, videos, live events, and creative services come together under one roof.
          </p>
          <p className="text-sm md:text-base text-foreground-300 leading-relaxed mt-4">
            From our flagship Tribe Dala Podcast to the Interview series, Girlies, blog, and events —
            everything we do is about amplifying voices, telling authentic stories, and creating
            opportunities for creators to grow, collaborate, and earn.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding pb-12 md:pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-xl md:text-3xl text-foreground-50 text-center mb-10">What We Stand For</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Community First', description: 'Everything we build starts with the people. Creators, fans, partners — we grow together.', icon: 'ri-group-line', color: 'primary' },
              { title: 'Authentic Voices', description: 'No filters, no gatekeeping. We amplify real stories from real people across Kenya and Africa.', icon: 'ri-mic-line', color: 'accent' },
              { title: 'Creative Freedom', description: 'We give creators the tools, platform, and support to express themselves without limits.', icon: 'ri-lightbulb-line', color: 'secondary' },
              { title: 'Economic Opportunity', description: 'Creativity is work. We help creators monetize their craft through tickets, services, and partnerships.', icon: 'ri-money-dollar-circle-line', color: 'primary' },
            ].map((val) => (
              <div key={val.title} className="card p-5 text-center">
                <div className={`w-12 h-12 rounded-lg bg-${val.color}-500/15 text-${val.color}-400 flex items-center justify-center mx-auto mb-4`}>
                  <i className={`${val.icon} text-xl`} />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-2">{val.title}</h3>
                <p className="text-xs text-foreground-500 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '2,847', label: 'Community Members' },
                { value: '156', label: 'Verified Creators' },
                { value: '23', label: 'Events Hosted' },
                { value: '4', label: 'Active Shows' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl md:text-3xl font-heading font-bold text-foreground-50">{stat.value}</p>
                  <p className="text-xs md:text-sm text-foreground-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founded */}
      <section className="section-padding pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-xl md:text-3xl text-foreground-50 mb-4">Founded in Kisumu, 2025</h2>
          <p className="text-sm text-foreground-400 leading-relaxed">
            TribeDala was started by a small group of creators who saw the untapped potential of
            Kisumu&apos;s creative scene. What began as a single podcast in a makeshift studio has grown
            into a full-fledged media hub — and we&apos;re just getting started.
          </p>
        </div>
      </section>
    </div>
  );
}