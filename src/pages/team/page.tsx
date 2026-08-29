import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOfficialMembers } from '@/lib/queries';
import type { Profile } from '@/lib/queries';

export default function TeamPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOfficialMembers()
      .then((data) => setMembers(data))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative pt-20 md:pt-28 pb-8 md:pb-12 section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-xs font-semibold text-primary-500 mb-4">
            <i className="ri-shield-star-line" />
            The Team
          </span>
          <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-foreground-50 mb-4">
            Official Members
          </h1>
          <p className="text-sm md:text-lg text-foreground-400 max-w-2xl mx-auto">
            The core team behind TribeDala. These are the people building the platform,
            curating content, and growing our community every single day.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section-padding py-8 md:py-12 bg-background-100">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse bg-background-200 h-[400px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {members.map((member) => (
                <div key={member.id} className="card overflow-hidden group">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/30 to-transparent" />
                  </div>
                  <div className="p-4 -mt-10 relative">
                    <h3 className="font-heading font-bold text-base md:text-lg text-foreground-50">
                      {member.full_name}
                    </h3>
                    <p className="text-xs text-primary-500 font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-xs text-foreground-500 leading-relaxed mb-3">
                      {member.bio}
                    </p>
                    {member.creator_category && (
                      <div className="flex flex-wrap gap-1">
                        <span
                          className="px-2 py-0.5 rounded bg-background-200 text-[10px] text-foreground-400"
                        >
                          {member.creator_category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
            Want to Join the Team?
          </h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            We&apos;re always looking for passionate people to help grow TribeDala.
            Reach out and tell us how you can contribute.
          </p>
          <Link to="/contact" className="btn-primary text-sm md:text-base inline-flex px-8 py-3">
            <i className="ri-mail-line mr-2" />
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
