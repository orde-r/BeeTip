CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"kurir_id" uuid,
	"to_location" varchar(500) NOT NULL,
	"item_desc" varchar(1000) NOT NULL,
	"item_price" numeric(12, 2),
	"delivery_fee" numeric(12, 2) DEFAULT '5000.00' NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"security_code" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_kurir_id_users_id_fk" FOREIGN KEY ("kurir_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;