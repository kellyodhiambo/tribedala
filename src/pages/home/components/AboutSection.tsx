import { Link } from 'react-router-dom';

export default function AboutSection() {
  return (
    <section className="section-padding py-16 md:py-24 bg-background-100 relative overflow-hidden">
      {/* Subtle bg accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src="https://prllmmcscqlsiezgaqrb.supabase.co/storage/v1/object/public/avatars/contentpmn.jpg"
                alt="TribeDala creators collaborating"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-4 md:-bottom-6 -right-2 md:right-6 bg-background-100 border border-background-300/40 rounded-lg p-3 md:p-4 shadow-xl">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <i className="ri-group-line text-primary-500 text-lg md:text-xl" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xl md:text-2xl text-foreground-50">0+</p>
                  <p className="text-[10px] md:text-xs text-foreground-500">Community Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="space-y-6">
            <span className="text-sm font-semibold text-accent-500 tracking-wide uppercase">
              Our Story
            </span>
            <h2 className="font-heading font-bold text-xl md:text-4xl lg:text-5xl text-foreground-50 leading-tight">
              Building East Africa&apos;s Most Vibrant Creator Community
            </h2>
            <div className="space-y-4 text-foreground-400 leading-relaxed">
              <p>
                TribeDala started in a small studio in Kisumu with one microphone and a dream:
                to give East African creators the platform they deserve. Today, we&apos;re a
                thriving ecosystem of podcasters, videographers, DJs, writers, photographers,
                and storytellers.
              </p>
              <p>
                We don&apos;t just produce content — we build careers. Through our podcasts,
                live events, creator services, and collaborative spaces, we help talent
                turn passion into sustainable livelihoods.
              </p>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2">
              {[
                { icon: 'ri-heart-line', label: 'Community First', desc: 'Every decision starts with our creators' },
                { icon: 'ri-lightbulb-line', label: 'Authentic Voices', desc: 'No scripts. Real stories. Real people.' },
                { icon: 'ri-rocket-line', label: 'Growth Mindset', desc: 'Investing in creator skills & careers' },
                { icon: 'ri-global-line', label: 'East African Pride', desc: 'Telling our stories to the world' },
              ].map((value) => (
                <div key={value.label} className="flex items-start gap-2 md:gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`${value.icon} text-primary-500 text-xs md:text-sm`} />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-xs md:text-sm text-foreground-200">
                      {value.label}
                    </p>
                    <p className="text-[10px] md:text-xs text-foreground-500">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/about" className="btn-primary text-sm inline-flex mt-4">
              Learn More About Us
              <i className="ri-arrow-right-line ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}