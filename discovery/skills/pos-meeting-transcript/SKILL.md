---
name: pos-meeting-transcript
description: >
  Transcribe a local meeting recording (a video-call recording, mp4, mkv, m4a, mp3) into a transcript
  with faster-whisper, on the machine, so the content stays confidential. Use when someone has a
  recording and no transcript (the transcription extension missed it or hit its limit), or says
  "transcribe this video", "extract the transcript", "write up this call but I only have the video",
  "video to transcript", "/pos-meeting-transcript". Once the transcript is produced, hand over to
  pos-meeting-notes for the write-up in the feedback base.
---

# Meeting transcript (local Whisper)

## Why this skill exists

Transcription extensions miss transcripts or cap their volume. The recording is kept instead, and a
local transcript is produced for `pos-meeting-notes`. The transcription runs on the machine with
`faster-whisper` (CPU, int8), so the content stays confidential.

This skill encodes a procedure validated after hours of debugging: don't rediscover its traps every
time.

Rule numbers refer to the collaboration rules of `pos-core`. Section 4 of the Discovery pivot
(`<pivots.dir>/product_discovery_context.md`) holds where the tool is installed.

---

## Setup

The tool is a folder on the machine that runs it:

- `venv/`: Python + `faster-whisper` (CPU only)
- `transcribe.py`: reads `input/`, writes `.txt` and `.srt` to `output/`
- `input/`: drop the recording here
- `output/`: the `.txt`, the `.srt`, and `run.log` / `run.err`
- ffmpeg, installed on the machine

**Where it is installed is asked once.** Read section 4 of the Discovery pivot. When it is empty, ask
the owner where the tool is installed (folder, Python of the virtual environment, ffmpeg folder when
it is not on the PATH, system), then write the answer into section 4 through a shown diff. Never
assume a path.

**The script's contract** (for a machine that does not have it yet): `transcribe.py <recording>
<model> <language>`; the recording defaults to the most recent file of `input/`, the model to
`small`, the language to auto-detect. It loads `WhisperModel(<model>, device="cpu",
compute_type="int8")`, transcribes with `vad_filter=True` and `beam_size=5`, writes one line per
segment to `output/<stem>.txt` and the timestamps to `output/<stem>.srt`, and prints `Loading
model...`, `Transcribing...`, `Detected: <language> | duration: <s>`, a progress line `[X.X%]
HH:MM:SS  text` every 20 segments, then `Done.`.

**When the virtual environment is broken** (a new machine, and so on): start again from `pip install
faster-whisper` in a new venv, Python 3.11 or later. Do not install `openai-whisper`: too slow, out of
memory with `medium` under 5 GB of free RAM.

The procedure below was validated on Windows; on another system, run the same steps with that
system's equivalents.

---

## Blocking pre-checks

Before launching, check:

1. **Free RAM:** `(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB` must be **at least 5
   GB** for `small`, **at least 6 GB** for `medium`. Below that, ask the owner to close the browser and
   other apps before continuing. Otherwise the process is killed silently (exit 5, no error log).
2. **Free disk:** at least 2 GB on the system drive for the model cache (`small` = 461 MB, `medium` =
   1.5 GB).
3. **The recording in `input/`:** the owner copies it there.

---

## Choice of model and language

| Model | Size | Peak RAM | Speed (CPU, int8) | When |
|---|---|---|---|---|
| `tiny` | 75 MB | ~0.7 GB | ~10x real time | test, very clear audio |
| `small` | 461 MB | ~2 GB | ~2x real time | **default**: clear speech |
| `medium` | 1.5 GB | ~5 GB | ~1x real time | strong accent |

**Language:** leave it unset (auto-detect) when unsure. **NEVER force a language the call was not
in:** Whisper then hallucinates coherent text in the forced language from the audio (total loss of
information).

---

## Workflow

1. **ALWAYS ask the owner the language first** with `AskUserQuestion` (the call's language, another
   one, auto-detect). Never assume, even when the contact's name suggests a language: the call may
   have been held in another one. Forcing the wrong language means a fully hallucinated transcript.
2. **Confirm the pre-checks:** free RAM, the recording in `input/`.
3. **Launch detached in the background** with `Start-Process` (NOT PowerShell's `*>`, which writes
   the log in UTF-16). `<folder>`, `<python>` and `<ffmpeg bin>` come from section 4 of the pivot:

```powershell
$env:PATH = "<ffmpeg bin>;$env:PATH"
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
$video = (Get-ChildItem "<folder>\input" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
$p = Start-Process `
  -FilePath "<python>" `
  -ArgumentList "<folder>\transcribe.py","`"$video`"","small","<language>" `
  -WorkingDirectory "<folder>" `
  -RedirectStandardOutput "<folder>\output\run.log" `
  -RedirectStandardError "<folder>\output\run.err" `
  -PassThru -WindowStyle Hidden
"PID: $($p.Id)"
```

4. **Schedule a check-in** at the estimated duration (audio x 0.5 for `small`, x 1 for `medium`), and
   watch progress, failure and stall (rule 8).
5. **Check progress:** the end of `run.log` shows `[X.X%] HH:MM:SS  text`. When the log stops at
   `Loading model...` with nothing after it: out of memory, check the RAM.
6. **Spot-check the quality** on the first three lines of the `.txt`: coherent sentences? If not
   (disjointed words, wrong language), kill and relaunch with `medium` or another language.
7. **When `Done.` appears:** go straight on to `pos-meeting-notes`, pointing at the `.txt` produced.

---

## Known traps

- **Silent out of memory:** exit 5 with no message. Always not enough RAM. Close apps or use a smaller
  model.
- **PowerShell `*>`:** produces a UTF-16 BOM file that cannot be read. Always use `Start-Process
  -RedirectStandardOutput/Error`.
- **`$args` in PowerShell:** a reserved variable. In a wrapper script, use `$cliArgs`.
- **A forced language on audio in another language:** Whisper hallucinates; always confirm the
  language first.
- **CJK or emoji in the help output:** Python on Windows with cp1252 crashes; always set
  `PYTHONIOENCODING=utf-8` and `PYTHONUTF8=1`.
- **Corrupted model:** when `Loading model...` downloads everything again on its own, the previous
  download was a SHA mismatch (probably interrupted by an out of memory). Delete the model's folder in
  the Hugging Face cache and relaunch.

---

## Output to pos-meeting-notes

`output/<recording name>.txt` holds one line per segment, which `pos-meeting-notes` accepts. The
`.srt` has the timestamps when needed. Hand over to `pos-meeting-notes` with the path of the `.txt`.

**No speakers:** `faster-whisper` does not diarise. The transcript is a continuous block of
sentences, with no "<team member>:" or "<contact>:". Consequences:

- When writing the write-up, identify the speakers from context (questions versus answers, content,
  tone).
- Always **warn the owner** in the draft write-up that the speakers were inferred, so they validate.
- If it becomes a recurring blocker: integrate `whisperx` (a free Hugging Face token and the
  acceptance of pyannote-audio on Hugging Face); it adds about 10 minutes of processing. Not by
  default: it is an extra cost for most cases.
