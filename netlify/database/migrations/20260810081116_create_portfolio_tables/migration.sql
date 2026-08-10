CREATE TABLE "about" (
	"id" serial PRIMARY KEY,
	"bio1" text,
	"bio2" text,
	"edu_title" text,
	"edu_meta" text,
	"thesis" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_settings" (
	"id" serial PRIMARY KEY,
	"password_hash" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"issuer" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" serial PRIMARY KEY,
	"email" text,
	"phone" text,
	"wa_link" text,
	"location" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" text PRIMARY KEY,
	"period" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"desc" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hero" (
	"id" serial PRIMARY KEY,
	"photo" text,
	"badge" text,
	"name" text,
	"title" text,
	"desc" text,
	"linkedin" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"period" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"image" text,
	"description" text,
	"tech" json,
	"link" text,
	"created_at" timestamp DEFAULT now()
);
