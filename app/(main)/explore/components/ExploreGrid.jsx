"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/data";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function InterviewerCard({ interviewer }) {
  const {
    id,
    name,
    imageUrl,
    title,
    company,
    yearsExp,
    bio,
    categories,
    creditRate,
    availabilities,
  } = interviewer;
  const availability = availabilities?.[0];

  return (
    <div className="group relative bg-[#0f0f11] border border-white/10 hover:border-amber-400/20 rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-400/5 via-transparent to-transparent pointer-events-none" />

      {/* Top row — avatar + name + availability */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 border border-white/10 shrink-0">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback className="bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium">
              {name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-stone-200 leading-tight">
              {name}
            </p>
            {title && company && (
              <p className="text-xs text-stone-500 mt-0.5">
                {title} · {company}
              </p>
            )}
          </div>
        </div>

        {yearsExp && (
          <Badge
            variant="outline"
            className="shrink-0 border-white/10 text-stone-500 text-xs"
          >
            {yearsExp}+ yrs
          </Badge>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-xs text-stone-400 font-light leading-relaxed line-clamp-2">
          {bio}
        </p>
      )}

      {/* Categories */}
      {categories?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 4).map((cat) => (
            <span
              key={cat}
              className="text-xs px-2.5 py-1 rounded-lg border border-amber-400/20 bg-amber-400/5 text-amber-400"
            >
              {CATEGORY_LABEL[cat] ?? cat}
            </span>
          ))}
          {categories.length > 4 && (
            <span className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-stone-600">
              +{categories.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="h-px bg-white/5" />

      {/* Bottom row — credit rate + availability + CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-serif leading-none bg-linear-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent">
            {creditRate ?? 10}
            <span className="text-xs text-stone-500 font-sans ml-1">
              credits / session
            </span>
          </p>
          {availability ? (
            <p className="text-xs text-stone-600">
              🟢 {formatTime(availability.startTime)} –{" "}
              {formatTime(availability.endTime)}
            </p>
          ) : (
            <p className="text-xs text-stone-700">No availability set</p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-amber-400/20 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/40"
          asChild
        >
          <Link href={`/interviewers/${id}`}>View profile →</Link>
        </Button>
      </div>
    </div>
  );
}

export default function ExploreGrid({ interviewers }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return interviewers.filter((i) => {
      const matchesCategory =
        activeCategory === null || i.categories?.includes(activeCategory);

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        i.name?.toLowerCase().includes(q) ||
        i.title?.toLowerCase().includes(q) ||
        i.company?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [interviewers, activeCategory, search]);

  return (
    <div className="flex flex-col gap-8">
      {/* Filters bar */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title or company…"
            className="pl-9 bg-[#0f0f11] border-white/10 text-stone-100 placeholder:text-stone-600 text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.value;
            return (
              <button
                key={String(cat.value)}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`text-xs px-4 py-2 rounded-lg border transition-all duration-200 ${
                  active
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                    : "border-white/10 text-stone-500 hover:border-white/20 hover:text-stone-400"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-stone-600">
        {filtered.length === 0
          ? "No interviewers found"
          : `${filtered.length} interviewer${
              filtered.length === 1 ? "" : "s"
            } found`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-stone-600 text-sm">
            No interviewers match your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              setSearch("");
            }}
            className="text-xs text-amber-400 mt-2 hover:text-amber-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((interviewer) => (
            <InterviewerCard key={interviewer.id} interviewer={interviewer} />
          ))}
        </div>
      )}
    </div>
  );
}
