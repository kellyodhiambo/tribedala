import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '@/lib/queries';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  created_at: string;
  updated_at: string;
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding py-16 md:py-24 bg-background-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <span className="text-xs md:text-sm font-semibold text-primary-500 tracking-wide uppercase mb-2 block">
            What We Do
          </span>
          <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground-50 mb-3 md:mb-4">
            Creator Services & Partnerships
          </h2>
          <p className="text-sm md:text-base text-foreground-400">
            From content production to event management, we provide the tools and
            expertise to turn creative ideas into reality.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse bg-background-200" />
            ))
          ) : (
            services.map((service, i) => (
              <div
                key={service.id}
                className="card p-6 group hover:bg-background-200/60 cursor-pointer"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                  <i className={`${service.icon} text-primary-500 text-xl group-hover:text-background-50 transition-colors`} />
                </div>
                <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-50 mb-2 group-hover:text-primary-500 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-foreground-400 leading-relaxed mb-4">
                  {service.description}
                </p>
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-1.5 mb-4">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-foreground-500">
                        <i className="ri-check-line text-primary-400 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="text-sm font-medium text-primary-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Request This Service
                  <i className="ri-arrow-right-line" />
                </span>
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/services" className="btn-secondary text-sm md:text-base px-8 py-3">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}