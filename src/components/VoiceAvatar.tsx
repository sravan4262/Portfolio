"use client";

import { useEffect, useState } from "react";
import VideoAvatar from "./VideoAvatar";
import AudioPlayer from "./AudioPlayer";

/**
 * Prefers the stage's talking-head video; falls back to the audio-only player
 * (with reactive avatar) if that stage's video isn't present. Optimistic — shows
 * the video immediately and only falls back if a HEAD probe says it's missing.
 */
export default function VoiceAvatar({
  id,
  audioSrc,
  label = "Hear me tell it",
}: {
  id: string;
  audioSrc: string;
  label?: string;
}) {
  const [videoMissing, setVideoMissing] = useState(false);

  useEffect(() => {
    let ok = true;
    fetch(`/video/${id}.mp4`, { method: "HEAD" })
      .then((r) => ok && !r.ok && setVideoMissing(true))
      .catch(() => ok && setVideoMissing(true));
    return () => {
      ok = false;
    };
  }, [id]);

  if (videoMissing) return <AudioPlayer id={id} src={audioSrc} label={label} />;
  return <VideoAvatar id={id} label={label} />;
}
