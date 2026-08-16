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
export type OrderStatus = "concept" | "open" | "paid" | "canceled" | "refunded";
export type BookingStatus =
  "geboekt" | "wachtlijst" | "geannuleerd" | "niet_verschenen";

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
  /** Zie de migration 20260815090000 voor het doel van elk veld hieronder. */
  birth_date: string | null;
  city: string | null;
  how_found: string | null;
  experience_level: string | null;
  goals: string | null;
  interests: string[];
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
  /** De bestelling die deze inschrijving betaalde; null bij handmatig toekennen. */
  order_id: string | null;
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

/**
 * Een geroosterde yogales. Let op het verschil met `Lesson`: dat is
 * lesmateriaal binnen een opleiding, dit is een les op een tijdstip.
 */
export type ClassSession = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number;
  location: string;
  capacity: number;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

/** Het rooster zoals bezoekers het zien: zonder wie er geboekt heeft. */
export type ClassSessionPublic = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number;
  location: string;
  capacity: number;
  cancelled_at: string | null;
  free_spots: number;
};

export type Booking = {
  id: string;
  class_session_id: string;
  profile_id: string;
  status: BookingStatus;
  created_at: string;
  cancelled_at: string | null;
};

/**
 * De financiële kant van een aankoop. De inschrijving is het toegangsrecht,
 * de bestelling de administratie; ze leven apart omdat een bestelling na een
 * AVG-verwijdering moet blijven staan (§8.4).
 */
export type Order = {
  id: string;
  profile_id: string;
  status: OrderStatus;
  amount_cents: number;
  currency: string;
  description: string;
  /** Mollie is de bron; wij bewaren alleen deze verwijzing. */
  mollie_payment_id: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  course_id: string | null;
  description: string;
  amount_cents: number;
  quantity: number;
};

export type CrmNoteKind = "notitie" | "verslag";

export type CrmNote = {
  id: string;
  profile_id: string;
  author_id: string;
  body: string;
  kind: CrmNoteKind;
  title: string | null;
  created_at: string;
};

/**
 * Een door de AI geschreven gespreksverslag. Uitsluitend voor de beheerder;
 * die bepaalt wat hij ervan met de klant deelt.
 */
export type CrmAnalyse = {
  id: string;
  profile_id: string;
  body: string;
  model: string;
  bevat_gezondheid: boolean;
  created_by: string | null;
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
          FK<"enrollments_order_id_fkey", "order_id", "orders">,
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
      orders: Table<
        Order,
        [FK<"orders_profile_id_fkey", "profile_id", "profiles">]
      >;
      order_items: Table<
        OrderItem,
        [
          FK<"order_items_order_id_fkey", "order_id", "orders">,
          FK<"order_items_course_id_fkey", "course_id", "courses">,
        ]
      >;
      crm_analyses: Table<
        CrmAnalyse,
        [
          FK<"crm_analyses_profile_id_fkey", "profile_id", "profiles">,
          FK<"crm_analyses_created_by_fkey", "created_by", "profiles">,
        ]
      >;
      class_sessions: Table<ClassSession>;
      bookings: Table<
        Booking,
        [
          FK<
            "bookings_class_session_id_fkey",
            "class_session_id",
            "class_sessions"
          >,
          FK<"bookings_profile_id_fkey", "profile_id", "profiles">,
        ]
      >;
    };
    Views: {
      content_blocks_public: {
        Row: ContentBlockPublic;
        Relationships: [];
      };
      class_sessions_public: {
        Row: ClassSessionPublic;
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
      // Lesrooster. Boeken en annuleren lopen bewust via functies: alleen zo
      // is de capaciteit onder gelijktijdige boekers houdbaar.
      // Gezondheidsgegevens staan in het schema `sensitive`, dat niet via de
      // API bereikbaar is. Deze twee functies zijn de enige ingang en loggen
      // elke inzage en wijziging (§8.3).
      haal_gezondheid: {
        Args: { p_profile_id: string };
        Returns: {
          body: string;
          consent_at: string;
          consent_note: string | null;
          updated_at: string;
          updated_by: string | null;
        }[];
      };
      bewaar_gezondheid: {
        Args: {
          p_profile_id: string;
          p_body: string;
          p_consent_note?: string | null;
        };
        Returns: undefined;
      };
      vrije_plekken: { Args: { p_session_id: string }; Returns: number };
      boek_les: { Args: { p_session_id: string }; Returns: BookingStatus };
      annuleer_boeking: { Args: { p_session_id: string }; Returns: undefined };
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
      booking_status: BookingStatus;
      crm_note_kind: CrmNoteKind;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
