-- Create user_topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS "user_topics" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "proficiency" TEXT,
    "interest" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "user_topics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_topics_user_id_topic_id_key" UNIQUE ("user_id", "topic_id")
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "user_topics_user_id_idx" ON "user_topics"("user_id");
CREATE INDEX IF NOT EXISTS "user_topics_topic_id_idx" ON "user_topics"("topic_id");

