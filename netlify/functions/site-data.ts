import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  hero,
  about,
  contact,
  projects,
  experiences,
  certifications,
  organizations,
  adminSettings,
} from "../../db/schema.js";

const initialSiteData = {
  hero: {
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    badge: 'S1 Informatika (IPK 3.72) • Unity & Network Security',
    name: 'Muhammad Rahman',
    title: 'Game Developer & IT Security Specialist',
    desc: 'Lulusan S1 Informatika Universitas Teknokrat Indonesia dengan keahlian dalam pengembangan Game 3D/AR interaktif menggunakan Unity Engine serta pengelolaan keamanan jaringan Fortinet.',
    linkedin: 'https://www.linkedin.com/in/muhammad-rahman-4ba16321a/'
  },
  about: {
    bio1: 'Memiliki keahlian unggul dalam gameplay programming, UI implementation, debugging, dan optimasi performa game pada platform Android & PC.',
    bio2: 'Berpengalaman pula dalam pengujian kualitas perangkat lunak (QA Testing) di Nusameta serta manajemen infrastruktur jaringan & firewall Fortinet di PT Info Solusindo Data Utama.',
    eduTitle: 'S1 Informatika - Universitas Teknokrat Indonesia',
    eduMeta: 'Sep 2021 - Mei 2025 • IPK: 3.72 / 4.00',
    thesis: 'Metatekno: Implementasi Gamification pada Metaverse Teknokrat Menggunakan Unity Engine'
  },
  contact: {
    email: 'mrahman.work20@gmail.com',
    phone: '+62 821-5119-9244',
    waLink: 'https://wa.me/6282151199244',
    location: 'Bandar Lampung, Indonesia'
  },
  projects: [
    {
      id: '1',
      title: 'Sandi Aksara 3D Game',
      category: '3D Educational Game',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      description: 'Game edukasi 3D interaktif pengenalan aksara Jawa. Dilengkapi Quest System, Trace Line & Drag-and-Drop Puzzle, serta Save Progress dengan PlayerPrefs.',
      tech: ['Unity 3D', 'C#', 'UI Architecture'],
      link: 'https://github.com'
    },
    {
      id: '2',
      title: 'Ido & Adi: Penjaga Pesisir',
      category: 'Game Dev (PT Bukit Asam Tbk)',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      description: 'Aplikasi game edukasi konservasi mangrove hasil kolaborasi CoE Metaverse dengan PT Bukit Asam Tbk.',
      tech: ['Unity', 'C#', 'Android Optimization'],
      link: ''
    },
    {
      id: '3',
      title: 'Sepakbola AR App',
      category: 'Augmented Reality',
      image: 'https://images.unsplash.com/photo-1579952318891-2147743322db?auto=format&fit=crop&w=800&q=80',
      description: 'Aplikasi AR interaktif untuk mengeksplorasi elemen 3D sepakbola melalui kamera smartphone.',
      tech: ['Unity', 'Vuforia SDK', 'C#'],
      link: ''
    }
  ],
  experiences: [
    {
      id: 'e1',
      period: 'Jun 2026 - Jul 2026',
      title: 'Game Developer',
      company: 'Sandi Aksara - Bandar Lampung',
      desc: 'Mengembangkan game edukasi 3D pengenalan Aksara Jawa menggunakan Unity & C#, mengimplementasikan Quest System, Puzzle System, serta save progress.'
    },
    {
      id: 'e2',
      period: 'Nov 2025 - Agu 2026',
      title: 'EOS IT Network Security',
      company: 'PT Info Solusindo Data Utama (Contract) - Kanwil BRI Lampung',
      desc: 'Mengelola perangkat keras keamanan Fortinet, konfigurasi firewall, VPN, serta menjaga stabilitas operasional jaringan.'
    },
    {
      id: 'e3',
      period: 'Des 2024 - Apr 2025',
      title: 'Programmer Intern (QA Testing)',
      company: 'Nusameta (PT Metaverse Indonesia Makmur)',
      desc: 'Melakukan pengujian manual fitur Visual Script Nodes di platform NusaStudio, identifikasi bug, serta pembuatan dokumentasi pengujian.'
    }
  ],
  certifications: [
    { id: 'c1', title: 'Fortinet Certified Associate in Cybersecurity', issuer: 'Fortinet Training Institute (Dec 2025 - Dec 2027)', image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80' },
    { id: 'c2', title: 'Senior Game Developer', issuer: 'Universitas Teknokrat Indonesia (Juli 2024)', image: '' },
    { id: 'c3', title: 'Junior AR/VR Developer', issuer: 'Universitas Teknokrat Indonesia (Februari 2024)', image: '' }
  ],
  organizations: [
    { id: 'o1', title: 'Wakil Ketua - Pusat Unggulan Metaverse (JuaraMeta)', period: 'Juli 2024 - Mei 2025 • Universitas Teknokrat Indonesia' },
    { id: 'o2', title: 'Wakil Ketua - HIMA Informatika', period: 'Jan 2024 - Feb 2025 • Universitas Teknokrat Indonesia' }
  ],
  adminPasswordHash: '4399e235e2aa6c1b3f79dd43c7b39670f5e156caebf4b63eecb642646c243a41' // SHA-256 for 'r#hm#n29'
};

async function seedDataIfEmpty() {
  const existingHero = await db.select().from(hero);
  if (existingHero.length === 0) {
    await db.insert(hero).values({
      photo: initialSiteData.hero.photo,
      badge: initialSiteData.hero.badge,
      name: initialSiteData.hero.name,
      title: initialSiteData.hero.title,
      desc: initialSiteData.hero.desc,
      linkedin: initialSiteData.hero.linkedin,
    });

    await db.insert(about).values({
      bio1: initialSiteData.about.bio1,
      bio2: initialSiteData.about.bio2,
      eduTitle: initialSiteData.about.eduTitle,
      eduMeta: initialSiteData.about.eduMeta,
      thesis: initialSiteData.about.thesis,
    });

    await db.insert(contact).values({
      email: initialSiteData.contact.email,
      phone: initialSiteData.contact.phone,
      waLink: initialSiteData.contact.waLink,
      location: initialSiteData.contact.location,
    });

    await db.insert(projects).values(initialSiteData.projects);
    await db.insert(experiences).values(initialSiteData.experiences);
    await db.insert(certifications).values(initialSiteData.certifications);
    await db.insert(organizations).values(initialSiteData.organizations);
    await db.insert(adminSettings).values({
      passwordHash: initialSiteData.adminPasswordHash,
    });
  }
}

export default async (req: Request) => {
  try {
    await seedDataIfEmpty();

    if (req.method === "GET") {
      const heroRows = await db.select().from(hero);
      const aboutRows = await db.select().from(about);
      const contactRows = await db.select().from(contact);
      const projectRows = await db.select().from(projects);
      const expRows = await db.select().from(experiences);
      const certRows = await db.select().from(certifications);
      const orgRows = await db.select().from(organizations);
      const adminRows = await db.select().from(adminSettings);

      const data = {
        hero: heroRows[0] || initialSiteData.hero,
        about: aboutRows[0] || initialSiteData.about,
        contact: contactRows[0] || initialSiteData.contact,
        projects: projectRows,
        experiences: expRows,
        certifications: certRows,
        organizations: orgRows,
        adminPasswordHash: adminRows[0]?.passwordHash || initialSiteData.adminPasswordHash,
      };

      return Response.json(data);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      if (action === "saveHeroBio") {
        const { photo, badge, name, title, desc, bio1, bio2 } = body;
        const heroRows = await db.select().from(hero);
        if (heroRows.length > 0) {
          await db.update(hero).set({ photo, badge, name, title, desc }).where(eq(hero.id, heroRows[0].id));
        } else {
          await db.insert(hero).values({ photo, badge, name, title, desc });
        }

        const aboutRows = await db.select().from(about);
        if (aboutRows.length > 0) {
          await db.update(about).set({ bio1, bio2 }).where(eq(about.id, aboutRows[0].id));
        } else {
          await db.insert(about).values({ bio1, bio2 });
        }

        return Response.json({ success: true });
      }

      if (action === "saveEdu") {
        const { eduTitle, eduMeta, thesis } = body;
        const aboutRows = await db.select().from(about);
        if (aboutRows.length > 0) {
          await db.update(about).set({ eduTitle, eduMeta, thesis }).where(eq(about.id, aboutRows[0].id));
        } else {
          await db.insert(about).values({ eduTitle, eduMeta, thesis });
        }
        return Response.json({ success: true });
      }

      if (action === "saveContact") {
        const { email, phone, waLink, location, linkedin } = body;
        const contactRows = await db.select().from(contact);
        if (contactRows.length > 0) {
          await db.update(contact).set({ email, phone, waLink, location }).where(eq(contact.id, contactRows[0].id));
        } else {
          await db.insert(contact).values({ email, phone, waLink, location });
        }

        const heroRows = await db.select().from(hero);
        if (heroRows.length > 0) {
          await db.update(hero).set({ linkedin }).where(eq(hero.id, heroRows[0].id));
        }
        return Response.json({ success: true });
      }

      if (action === "addProject") {
        const { project } = body;
        await db.insert(projects).values({
          id: project.id,
          title: project.title,
          category: project.category,
          image: project.image,
          description: project.description,
          tech: project.tech,
          link: project.link,
        });
        return Response.json({ success: true });
      }

      if (action === "deleteProject") {
        const { id } = body;
        await db.delete(projects).where(eq(projects.id, id));
        return Response.json({ success: true });
      }

      if (action === "addExperience") {
        const { experience } = body;
        await db.insert(experiences).values({
          id: experience.id,
          period: experience.period,
          title: experience.title,
          company: experience.company,
          desc: experience.desc,
        });
        return Response.json({ success: true });
      }

      if (action === "deleteExperience") {
        const { id } = body;
        await db.delete(experiences).where(eq(experiences.id, id));
        return Response.json({ success: true });
      }

      if (action === "addCert") {
        const { certification } = body;
        await db.insert(certifications).values({
          id: certification.id,
          title: certification.title,
          issuer: certification.issuer,
          image: certification.image,
        });
        return Response.json({ success: true });
      }

      if (action === "deleteCert") {
        const { id } = body;
        await db.delete(certifications).where(eq(certifications.id, id));
        return Response.json({ success: true });
      }

      if (action === "changeAdminPassword") {
        const { passwordHash } = body;
        const adminRows = await db.select().from(adminSettings);
        if (adminRows.length > 0) {
          await db.update(adminSettings).set({ passwordHash }).where(eq(adminSettings.id, adminRows[0].id));
        } else {
          await db.insert(adminSettings).values({ passwordHash });
        }
        return Response.json({ success: true });
      }

      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error: any) {
    console.error("API error:", error);
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/site-data",
};
