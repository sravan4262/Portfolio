# 🎙️ Voice scripts — "The Pipeline"

✅ **Recorded & live.** Clips are committed at `public/audio/*.m4a` (converted from the Voice Memos
originals in `/Memos`) and wired into the app — the ▶ button on each stage plays them.

The text below is **transcribed from the actual recordings** (via local whisper), lightly cleaned,
and kept in sync with the on-screen blurb + transcript in `src/content/stages.ts`.
Click-to-play only — never autoplay.

| # | Stage | File | Transcript (as recorded) |
|---|---|---|---|
| 0 | init | `public/audio/init.m4a` | "Runner's up. Nine years of experience, two live apps, and the audacity to deploy on a Friday. Let's go." |
| 1 | Education | `public/audio/education.m4a` | "I studied electrical engineering — until I realized you can't Ctrl-Z a soldering iron. So I switched to software." |
| 2 | Accenture | `public/audio/accenture.m4a` | "First real job: government healthcare claims — enough XML to gift-wrap the whole planet. Made the database faster anyway." |
| 3 | UPMC Health Plan | `public/audio/upmc.m4a` | "Seven years here at UPMC. Found a search so slow it qualified as a coffee break — if you know what I mean. Rebuilt it on Azure, double the speed." |
| 4 | Citrix | `public/audio/citrix.m4a` | "Right now: three clouds, FedRAMP High, security on hard mode. I taught an AI to file the Jira tickets, so I don't have to." |
| 5 | Byte AI | `public/audio/byteai.m4a` | "First indie app — a social app for devs. Backend, web, iPhone app, everything, all me. Fueled entirely by coffee and beer." |
| 6 | Infinity Finances | `public/audio/infinity.m4a` | "Did you ever feel like you're going broke but not knowing when? Well, feed this app with your data, so I know if you're broke or not — and so do you." |
| 7 | TrueSpend | `public/audio/truespend.m4a` | "TrueSpend — I co-founded this. You walk into a store and your phone snitches on your wallet. And also, iOS sometimes kills the battery, as you know. So, that's my app." |
| 8 | Skills | `public/audio/skills.m4a` | "The whole toolbox — languages, frameworks, cloud, AI, databases, blah blah blah. I'm pretty good at everything. At least I like to think so." |
| 9 | cleanup | `public/audio/cleanup.m4a` | "Thanks for wasting your time on my pipeline run — there's nothing better you could do, right? Hey, at least everything's green, zero rollbacks, nobody got paged. If you liked the build, just hire me." |

---

### Re-recording a stage
1. Replace its `Memos/<Name>.qta` (or drop a new file straight into `public/audio/<id>.m4a`).
2. Convert: `afconvert -f m4af -d aac "Memos/<Name>.qta" "public/audio/<id>.m4a"`
3. Update the transcript here + in `src/content/stages.ts` to match the new wording.
