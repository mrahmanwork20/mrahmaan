import { pgTable, serial, text, json, timestamp } from "drizzle-orm/pg-core";

export const hero = pgTable("hero", {
  id: serial("id").primaryKey(),
  photo: text("photo"),
  badge: text("badge"),
  name: text("name"),
  title: text("title"),
  desc: text("desc"),
  linkedin: text("linkedin"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const about = pgTable("about", {
  id: serial("id").primaryKey(),
  bio1: text("bio1"),
  bio2: text("bio2"),
  eduTitle: text("edu_title"),
  eduMeta: text("edu_meta"),
  thesis: text("thesis"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contact = pgTable("contact", {
  id: serial("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  waLink: text("wa_link"),
  location: text("location"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  image: text("image"),
  description: text("description"),
  tech: json("tech").$type<string[]>(),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: text("id").primaryKey(),
  period: text("period").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  desc: text("desc"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const certifications = pgTable("certifications", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  period: text("period").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
