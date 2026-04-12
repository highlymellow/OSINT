import React from 'react'

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Footer2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

export const Footer2 = ({
  logo = {
    src: "https://www.shadcnblocks.com/images/block/block-1.svg",
    alt: "MERIDIAN Logo",
    title: "MERIDIAN OSINT",
    url: "#",
  },
  tagline = "Strategic Intelligence Platform.",
  menuItems = [
    {
      title: "Modules",
      links: [
        { text: "Overview", url: "#" },
        { text: "STI Radar", url: "#" },
        { text: "Signal", url: "#" },
        { text: "Terrain", url: "#" },
        { text: "Nexus", url: "#" },
        { text: "Lens", url: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About MERIDIAN", url: "#" },
        { text: "Ethical OSINT", url: "#" },
        { text: "Research", url: "#" },
        { text: "Careers", url: "#" },
        { text: "Contact", url: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Analyst Docs", url: "#" },
        { text: "API Reference", url: "#" },
        { text: "Methodology", url: "#" },
      ],
    },
  ],
  copyright = "© 2026 MERIDIAN Intelligence Hub. All rights reserved.",
  bottomLinks = [
    { text: "Terms of Service", url: "#" },
    { text: "Privacy Protocol", url: "#" },
  ],
}: Footer2Props) => {
  return (
    <section className="py-24 border-t border-border/50 relative z-10 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-3 lg:justify-start mb-6">
                <div className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center border border-gold/30">
                  <div className="w-3 h-3 bg-gold rounded-sm" />
                </div>
                <p className="text-xl font-bold font-mono tracking-widest">{logo.title}</p>
              </div>
              <p className="mt-4 font-semibold text-muted-foreground">{tagline}</p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-foreground">{section.title}</h3>
                <ul className="space-y-4 text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-gold transition-colors duration-200"
                    >
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-24 flex flex-col justify-between gap-4 border-t border-border pt-8 text-sm font-medium text-muted-foreground md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="hover:text-gold transition-colors duration-200">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};
