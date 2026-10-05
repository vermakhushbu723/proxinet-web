import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { solutionFamilies, findFamily, findChild } from '../data/solutions';
import { Stagger, StaggerItem, SectionHead } from '../components/ui';
import { PageHero, CTABand, InfoCard, dotList, SplitFeature } from '../components/blocks';
import { familyImg, solutionImg } from '../data/images';


/* =================== HUB: /solutions =================== */
export function SolutionsHub() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="The full IT stack, one accountable partner"
        sub="Seven practice areas, 40+ services — one accountable partner."
        crumbs={[{ label: 'Solutions' }]}
      />
      <section className="px-container px-section">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {solutionFamilies.map((f) => (
            <StaggerItem key={f.slug}>
              <InfoCard
                to={`/solutions/${f.slug}`} image={familyImg(f.slug, 800)} as="h2"
                title={f.name} meta={dotList(f.children.slice(0, 4).map((c) => c.name))}
                text={f.blurb} cta="Explore solution"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTABand />
    </>
  );
}

/* =================== FAMILY: /solutions/:family =================== */
export function SolutionFamily() {
  const { family } = useParams();
  const f = findFamily(family);
  if (!f) return <Navigate to="/solutions" replace />;

  return (
    <>
      <PageHero
        eyebrow={f.tag} title={f.name} sub={f.hero}
        crumbs={[{ label: 'Solutions', to: '/solutions' }, { label: f.name }]}
      />

      {/* children */}
      <section className="px-container px-section">
        <div>
          <SectionHead eyebrow="Services" title={`What ${f.name} includes`} />
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {f.children.map((c) => (
              <StaggerItem key={c.slug}>
                <InfoCard
                  to={`/solutions/${f.slug}/${c.slug}`} image={solutionImg(c.slug, 800)}
                  title={c.name} meta={f.name} text={c.blurb} cta="View details"
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTABand />
    </>
  );
}

/* =================== DETAIL: /solutions/:family/:slug =================== */
export function SolutionDetail() {
  const { family, slug } = useParams();
  const f = findFamily(family);
  const c = findChild(family, slug);
  if (!f || !c) return <Navigate to="/solutions" replace />;

  return (
    <>
      <PageHero
        eyebrow={f.name} title={c.name} sub={c.blurb}
        crumbs={[{ label: 'Solutions', to: '/solutions' }, { label: f.name, to: `/solutions/${f.slug}` }, { label: c.name }]}
      />

      <div className="px-container px-section">
        <div className="min-w-0">
          {/* what you get */}
          <SplitFeature
            image={solutionImg(c.slug, 800)} alt={c.name}
            eyebrow={f.name} title="What gets delivered" intro={c.blurb}
            points={c.bullets}
          />

        </div>

      </div>

      <CTABand />
    </>
  );
}
