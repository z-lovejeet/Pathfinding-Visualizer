CREATE TABLE "shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"grid_data" json NOT NULL,
	"algorithm" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
