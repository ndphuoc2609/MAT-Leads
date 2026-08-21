import { Download, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Recording } from "@/lib/customer-processing-api";

let activeAudio: HTMLAudioElement | null = null;
let activeStop: (() => void) | null = null;

function formatDuration(seconds: number) {
  return Number.isFinite(seconds)
    ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
    : "0:00";
}

function Player({ recording }: { recording: Recording }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(recording.url);
    audioRef.current = audio;
    const onLoaded = () => {
      setLoaded(true);
      setDuration(audio.duration);
    };
    const onTime = () =>
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onError = () => setError(true);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      if (activeAudio === audio) {
        activeAudio = null;
        activeStop = null;
      }
    };
  }, [recording.url]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    activeStop?.();
    activeAudio?.pause();
    activeAudio = audio;
    activeStop = () => setPlaying(false);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="flex min-w-[250px] items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={!loaded || error}
        aria-label={playing ? `Tạm dừng ${recording.label}` : `Phát ${recording.label}`}
        className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {playing ? <Pause className="size-3" /> : <Play className="size-3 fill-current" />}
      </button>
      <span className="h-1 min-w-12 flex-1 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-primary/55"
          style={{ width: `${progress}%` }}
        />
      </span>
      <span className="w-8 text-right text-[10px] text-muted-foreground tabular-nums">
        {formatDuration(duration)}
      </span>
      <a
        href={recording.url}
        download
        target="_blank"
        rel="noreferrer"
        aria-label={`Tải ${recording.label}`}
        title="Tải file ghi âm"
        className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-primary"
      >
        <Download className="size-3.5" />
      </a>
      {error ? <span className="text-[10px] text-destructive">Lỗi audio</span> : null}
    </div>
  );
}

export function RecordingPlayer({ recordings }: { recordings: Recording[] }) {
  return recordings.length === 0 ? (
    <span className="text-[10px] text-muted-foreground">Chưa có file ghi âm</span>
  ) : (
    <div className="space-y-1.5">
      {recordings.map((recording) => (
        <Player key={`${recording.label}-${recording.url}`} recording={recording} />
      ))}
    </div>
  );
}
