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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background-50 pt-14 md:pt-20">
      {/* Hero */}
      <section className="section-padding py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-heading text-2xl md:text-4xl text-foreground-50">What We Do</h1>
          <p className="text-sm md:text-base text-foreground-400 mt-4 leading-relaxed">
            TribeDala is more than a media platform — we are a full-service creative agency.
            From content production to event hosting, marketing to ticketing, we help creators, brands,
            and businesses tell their stories and grow their audiences.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse bg-background-200 h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {services.map((service) => (
              <div key={service.id} className="card p-6 flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-primary-500/15 text-primary-400 flex items-center justify-center mb-4">
                  <i className={`${service.icon} text-xl`} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground-50 mb-2">{service.title}</h3>
                <p className="text-sm text-foreground-400 leading-relaxed mb-4">{service.description}</p>
                <ul className="space-y-2 flex-1">
                  {service.features && service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-foreground-500">
                      <i className="ri-check-line text-primary-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-background-300/30">
                  <Link
                    to={`/get-involved?flow=services`}
                    className="btn-primary w-full text-sm"
                  >
                    Request This Service
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="section-padding pb-20">
        <div className="max-w-2xl mx-auto text-center card p-8 md:p-10">
          <h2 className="font-heading text-xl md:text-2xl text-foreground-50 mb-3">
            Not sure what you need?
          </h2>
          <p className="text-sm text-foreground-400 mb-6 leading-relaxed">
            Reach out and tell us about your project. We&apos;ll help you figure out the best approach
            and put together a custom plan.
          </p>
          <Link to="/contact" className="btn-primary text-sm">
            <i className="ri-mail-line mr-2" />
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}