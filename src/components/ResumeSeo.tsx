import { profile, stages } from "@/content/stages";

/**
 * Visually-hidden, fully static résumé text rendered server-side so crawlers
 * and no-JS visitors get the complete content regardless of the interactive
 * (client-streamed) pipeline above it.
 */
export default function ResumeSeo() {
  return (
    <section className="sr-only" aria-hidden>
      <h1>
        {profile.name} — {profile.title}
      </h1>
      <p>{profile.summary}</p>
      <p>
        {profile.location} · {profile.email} · {profile.phone}
      </p>
      {stages.map((s) => (
        <article key={s.id}>
          <h2>
            {s.label}
            {s.sublabel ? ` — ${s.sublabel}` : ""} {s.dates ?? s.years ?? ""}
          </h2>
          <p>{s.about}</p>
          {s.tech && (
            <ul>
              {s.tech.map((t) => (
                <li key={t.name}>
                  {t.name} — {t.why}
                </li>
              ))}
            </ul>
          )}
          {s.skillGroups?.map((g) => (
            <p key={g.category}>
              <strong>{g.category}:</strong> {g.items.join(", ")}
            </p>
          ))}
        </article>
      ))}
    </section>
  );
}
