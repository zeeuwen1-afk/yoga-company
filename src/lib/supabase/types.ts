/**
 * Databasetypes, afgeleid van de migrations in supabase/migrations.
 *
 * Regenereren tegen de live database kan met:
 *   pnpm db:types
 *
 * Houd dit bestand in lijn met de migrations: het is de enige plek waar de
 * applicatie weet welke kolommen bestaan.
 */

export type UserRole = "admin" | "klant";
export type CourseType = "opleiding" | "training";
export type EnrollmentStatus =
  "in_afwachting" | "betaald" | "geannuleerd" | "afgerond";
export type RequestKind =
  "inschrijving" | "vraag" | "wijziging" | "avg_export" | "avg_verwijdering";
export type RequestStatus = "open" | "in_behandeling" | "afgerond";
export type BlockKind = "text" | "richtext" | "image" | "video";
export type ContentKind = "video" | "pdf" | "tekst";
export type PostStatus = "concept" | "gepland" | "gepubliceerd" | "mislukt";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relatie = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<
  Row,
  Relaties extends Relatie[] = [],
  Insert = Partial<Row>,
  Update = Partial<Row>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relaties;
};

/**
 * De relaties tussen de tabellen. Zonder deze opgave kan Supabase geneste
 * queries (`lessons ( content_items ( … ) )`) niet typeren en valt alles terug
 * op `string`. Ze volgen één op één de foreign keys uit de migrations.
 */
type FK<
  Naam extends string,
  Kolom extends string,
  Doel extends string,
  Uniek extends boolean = false,
> = {
  foreignKeyName: Naam;
  columns: [Kolom];
  isOneToOne: Uniek;
  referencedRelation: Doel;
  referencedColumns: ["id"];
};

export type Profile = {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  marketing_consent_at: string | null;
  created_at: string;
  deleted_at: string | null;
};

export type Course = {
  id: string;
  type: CourseType;
  title: string;
  slug: string;
  summary: string;
  description: string;
  audience: string | null;
  requirements: string | null;
  curriculum: Json | null;
  study_load_text: string | null;
  location: string | null;
  max_participants: number | null;
  certificate_text: string | null;
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  has_digital_content: boolean;
  is_active: boolean;
  sort: number;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  sort: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  sort: number;
};

export type ContentItem = {
  id: string;
  lesson_id: string;
  kind: ContentKind;
  title: string;
  body: string | null;
  storage_path: string | null;
  duration_seconds: number | null;
  is_preview: boolean;
  sort: number;
};

export type Enrollment = {
  id: string;
  profile_id: string;
  course_id: string;
  status: EnrollmentStatus;
  stripe_checkout_session_id: string | null;
  amount_cents: number | null;
  paid_at: string | null;
  created_at: string;
};

export type Progress = {
  profile_id: string;
  content_item_id: string;
  last_position_seconds: number;
  completed_at: string | null;
  updated_at: string;
};

export type Request = {
  id: string;
  profile_id: string;
  kind: RequestKind;
  body: string | null;
  status: RequestStatus;
  handled_by: string | null;
  created_at: string;
  closed_at: string | null;
};

export type Conversation = {
  id: string;
  profile_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type ContentBlock = {
  page_key: string;
  block_key: string;
  kind: BlockKind;
  value: Json;
  draft_value: Json | null;
  updated_by: string | null;
  updated_at: string;
};

export type ContentBlockPublic = {
  page_key: string;
  block_key: string;
  kind: BlockKind;
  value: Json;
  updated_at: string;
};

export type CrmNote = {
  id: string;
  profile_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  body: string;
  created_at: string;
};

export type Mailing = {
  id: string;
  subject: string;
  body_html: string;
  segment: string;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  /** Hoeveel mensen de mailing ontvingen — nooit wie (§17.6). */
  recipient_count: number;
  error: string | null;
};

export type SocialPost = {
  id: string;
  platform: "instagram" | "facebook" | "beide";
  caption: string;
  image_path: string | null;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  error: string | null;
  created_by: string | null;
  created_at: string;
  topic: string | null;
  goal: string | null;
};

export type AuditLogEntry = {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  meta: Json | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      crm_notes: Table<
        CrmNote,
        [
          FK<"crm_notes_profile_id_fkey", "profile_id", "profiles">,
          FK<"crm_notes_author_id_fkey", "author_id", "profiles">,
        ]
      >;
      courses: Table<Course>;
      course_modules: Table<
        CourseModule,
        [FK<"course_modules_course_id_fkey", "course_id", "courses">]
      >;
      lessons: Table<
        Lesson,
        [FK<"lessons_module_id_fkey", "module_id", "course_modules">]
      >;
      content_items: Table<
        ContentItem,
        [FK<"content_items_lesson_id_fkey", "lesson_id", "lessons">]
      >;
      enrollments: Table<
        Enrollment,
        [
          FK<"enrollments_profile_id_fkey", "profile_id", "profiles">,
          FK<"enrollments_course_id_fkey", "course_id", "courses">,
        ]
      >;
      progress: Table<
        Progress,
        [
          FK<"progress_profile_id_fkey", "profile_id", "profiles">,
          FK<
            "progress_content_item_id_fkey",
            "content_item_id",
            "content_items"
          >,
        ]
      >;
      requests: Table<
        Request,
        [
          FK<"requests_profile_id_fkey", "profile_id", "profiles">,
          FK<"requests_handled_by_fkey", "handled_by", "profiles">,
        ]
      >;
      conversations: Table<
        Conversation,
        [FK<"conversations_profile_id_fkey", "profile_id", "profiles", true>]
      >;
      messages: Table<
        Message,
        [
          FK<
            "messages_conversation_id_fkey",
            "conversation_id",
            "conversations"
          >,
          FK<"messages_sender_id_fkey", "sender_id", "profiles">,
        ]
      >;
      content_blocks: Table<
        ContentBlock,
        [FK<"content_blocks_updated_by_fkey", "updated_by", "profiles">]
      >;
      contact_messages: Table<ContactMessage>;
      mailings: Table<
        Mailing,
        [FK<"mailings_created_by_fkey", "created_by", "profiles">]
      >;
      social_posts: Table<
        SocialPost,
        [FK<"social_posts_created_by_fkey", "created_by", "profiles">]
      >;
      audit_log: Table<
        AuditLogEntry,
        [FK<"audit_log_actor_id_fkey", "actor_id", "profiles">]
      >;
    };
    Views: {
      content_blocks_public: {
        Row: ContentBlockPublic;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      has_course_access: { Args: { p_course_id: string }; Returns: boolean };
      course_id_for_lesson: { Args: { p_lesson_id: string }; Returns: string };
      // AVG-functies; de rechtencontrole zit in de functies zelf (§17.7).
      anonimiseer_profiel: {
        Args: { p_profile_id: string };
        Returns: undefined;
      };
      zet_profiel_actief: {
        Args: { p_profile_id: string; p_actief: boolean };
        Returns: undefined;
      };
      zet_profiel_rol: {
        Args: { p_profile_id: string; p_rol: UserRole };
        Returns: undefined;
      };
      // Maandelijkse opschoontaak (§17.6); geeft terug wat er is opgeruimd.
      opruimen_bewaartermijnen: {
        Args: Record<string, never>;
        Returns: {
          contactberichten: number;
          mailings: number;
          profielen: number;
          auditregels: number;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      course_type: CourseType;
      enrollment_status: EnrollmentStatus;
      request_kind: RequestKind;
      request_status: RequestStatus;
      block_kind: BlockKind;
      content_kind: ContentKind;
      post_status: PostStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
