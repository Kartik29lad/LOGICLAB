"use client";

import { useMemo, useState } from "react";

import type { ContentPackage, Difficulty } from "@/content/schema/content-types";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/status";

import { ContentCard } from "./content-card";
import { filterDiscovery } from "./discovery-utils";

export function DiscoveryExplorer({
  items,
  type,
  categories,
  tags: tagsProp,
  initialQuery,
  initialCategory,
  initialDifficulty,
  initialTag,
}: Readonly<{
  items: ContentPackage[];
  type: "algorithms" | "data-structures";
  categories: string[];
  tags?: string[];
  initialQuery?: string;
  initialCategory?: string;
  initialDifficulty?: Difficulty | "ALL";
  initialTag?: string;
}>) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState(initialCategory ?? "ALL");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">(initialDifficulty ?? "ALL");
  const [tag, setTag] = useState(initialTag ?? "ALL");
  const tags = useMemo(
    () => (tagsProp ?? [...new Set(items.flatMap((item) => item.metadata.tags))]).sort(),
    [items, tagsProp]
  );
  const filtered = useMemo(
    () => filterDiscovery(items, { query, category, difficulty, tag }),
    [items, query, category, difficulty, tag]
  );

  return (
    <section className="discovery-explorer" aria-label={`${type} discovery`}>
      <div className="discovery-layout">
        <aside className="discovery-filters" aria-label="Discovery filters">
          <div className="discovery-filters__header">
            <span className="page-header__eyebrow">Discover</span>
            <strong>Filters</strong>
          </div>
          <label className="field discovery-toolbar__search">
            <span>Search</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${type}...`}
              type="search"
            />
          </label>
          <label className="field">
            <span>Category</span>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="ALL">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
          <label className="field">
            <span>Difficulty</span>
            <Select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty | "ALL")}
            >
              <option value="ALL">All levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          </label>
          <label className="field">
            <span>Topic / tag</span>
            <Select value={tag} onChange={(event) => setTag(event.target.value)}>
              <option value="ALL">All topics</option>
              {tags.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
        </aside>
        <div className="discovery-results">
          <p className="discovery-result-count" aria-live="polite">
            Showing {filtered.length} of {items.length}
          </p>
          {filtered.length === 0 ? (
            <EmptyState
              title="No matches found"
              description="Try a different search term, category, or difficulty."
            />
          ) : (
            <div className="discovery-grid">
              {filtered.map((item) => (
                <ContentCard key={item.metadata.slug} item={item} type={type} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
