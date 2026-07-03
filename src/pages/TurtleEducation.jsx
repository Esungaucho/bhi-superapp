import React from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2, LightbulbOff, Hand, Users, Shield, Trash2, Shovel, CameraOff,
  MapPin, Heart, ArrowRight, Sparkles
} from 'lucide-react';

const RULES = [
  { icon: Volume2, title: 'Stay Quiet', desc: 'Keep voices low and calm. Loud noises can disorient hatchlings.' },
  { icon: LightbulbOff, title: 'Keep Lights Off', desc: 'No flashlights, phone lights, or flash photography. Light confuses hatchlings.' },
  { icon: Hand, title: 'Do Not Touch', desc: 'Never touch or pick up hatchlings. Let them make their own way to the ocean.' },
  { icon: Users, title: 'Do Not Crowd', desc: 'Give the nest plenty of space. Stand back and watch from a distance.' },
  { icon: Shield, title: 'Follow Instructions', desc: 'Listen to turtle conservancy volunteers. They are there to protect the turtles.' },
  { icon: Trash2, title: 'Keep Beach Clean', desc: 'Remove all trash. Plastic and debris are deadly to sea turtles.' },
  { icon: Shovel, title: 'Fill Holes', desc: 'Fill in holes and flatten sandcastles before leaving the beach.' },
  { icon: CameraOff, title: 'No Flash Photography', desc: 'Flash can blind and disorient hatchlings. Use natural light only.' },
];

const FACTS = [
  { stat: '60 days', label: 'Average incubation' },
  { stat: '1 in 1,000', label: 'Survives to adulthood' },
  { stat: '3 species', label: 'Nest on BHI beaches' },
];

export default function TurtleEducation() {
  return (
    <div className="pb-12">
      {/* Hero */}
      <div className="relative h-[340px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=1200&auto=format"
          alt="Sea turtle in clear blue water"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep/40 via-ocean-deep/30 to-background" />
        <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 w-fit mb-3">
            <Sparkles className="w-3 h-3 text-white/80" strokeWidth={1.5} />
            <span className="text-[10px] tracking-luxe-sm uppercase">Conservation</span>
          </div>
          <h1 className="font-heading text-[1.75rem] leading-[1.1] text-balance">
            Protecting Our Sea Turtles
          </h1>
          <p className="text-sm text-white/80 mt-2 max-w-xs">
            Bald Head Island is a sanctuary for loggerhead, green, and leatherback sea turtles.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-luxe grid grid-cols-3 gap-4">
          {FACTS.map((f, i) => (
            <div key={i} className="text-center">
              <p className="font-heading text-lg text-ocean">{f.stat}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-1">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Intro */}
      <div className="px-5 mt-8">
        <p className="text-sm text-foreground leading-relaxed">
          Every summer, female sea turtles return to our shores to lay their nests. After about 60 days,
          tiny hatchlings emerge and make their way to the ocean. This ancient cycle is fragile —
          and our island community plays a vital role in protecting it.
        </p>
      </div>

      {/* Rules */}
      <div className="px-5 mt-8">
        <h2 className="font-heading text-xl text-foreground mb-1">Turtle Safety Guidelines</h2>
        <p className="text-xs text-muted-foreground mb-5">
          If you encounter a nest or witness a hatching, please follow these rules.
        </p>

        <div className="space-y-3">
          {RULES.map((rule, i) => {
            const Icon = rule.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 bg-card border border-border/40 rounded-2xl p-4 shadow-luxe-sm"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 text-accent flex-shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{rule.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nest Map Link */}
      <div className="px-5 mt-8">
        <Link
          to="/turtles/map"
          className="block relative rounded-3xl overflow-hidden shadow-luxe-lg group"
        >
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format"
            alt="Beach at sunset"
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <MapPin className="w-5 h-5 mb-2 text-white/80" strokeWidth={1.5} />
            <p className="font-heading text-lg">View Active Nests</p>
            <p className="text-xs text-white/70 mt-0.5">See tracked nests on our island beach map</p>
            <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold">
              Open Map <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </span>
          </div>
        </Link>
      </div>

      {/* Community CTA */}
      <div className="px-5 mt-8">
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 text-center">
          <Heart className="w-6 h-6 text-accent mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-foreground">Share Your Sightings</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Post turtle photos and updates in the Island Chat community. All posts are reviewed to
            protect wildlife and prevent unsafe location sharing.
          </p>
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            Open Island Chat <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}