// import { useEffect, useRef } from "react";
// import type { CallPhase } from "@/context/CallContext";
// import incomingRingtoneUrl from "@/assets/sounds/incoming-ringtone.mp3";
// import outgoingRingbackUrl from "@/assets/sounds/outgoing-ringback.mp3";

// /**
//  * Plays the right looping sound for the current call phase:
//  *  - "ringing"  (callee is being notified of an incoming call) -> ringtone
//  *  - "calling"  (caller is waiting for the callee to pick up)  -> ringback
//  *  - anything else                                             -> silence
//  *
//  * Mount this once, globally (alongside <GlobalCallOverlay />), and feed it
//  * the live call phase. It owns its own <audio> elements so it keeps working
//  * across re-renders/navigation without re-fetching the file each time.
//  */
// export function useCallSound(phase: CallPhase | undefined) {
//   const ringtoneRef = useRef<HTMLAudioElement | null>(null);
//   const ringbackRef = useRef<HTMLAudioElement | null>(null);

//   // Create the <audio> elements once.
//   useEffect(() => {
//     const ringtone = new Audio(incomingRingtoneUrl);
//     ringtone.loop = true;
//     ringtone.preload = "auto";
//     ringtoneRef.current = ringtone;

//     const ringback = new Audio(outgoingRingbackUrl);
//     ringback.loop = true;
//     ringback.preload = "auto";
//     ringbackRef.current = ringback;

//     return () => {
//       ringtone.pause();
//       ringback.pause();
//       ringtoneRef.current = null;
//       ringbackRef.current = null;
//     };
//   }, []);

//   useEffect(() => {
//     const ringtone = ringtoneRef.current;
//     const ringback = ringbackRef.current;
//     if (!ringtone || !ringback) return;

//     const play = (el: HTMLAudioElement) => {
//       el.currentTime = 0;
//       // Autoplay can be blocked if there's been no user gesture yet; that's
//       // fine for a ringtone/ringback (there's essentially always been prior
//       // interaction with the app by the time a call is possible), but we
//       // still swallow the rejection so it doesn't surface as an unhandled
//       // promise rejection in the console.
//       void el.play().catch(() => {});
//     };
//     const stop = (el: HTMLAudioElement) => {
//       el.pause();
//       el.currentTime = 0;
//     };

//     if (phase === "ringing") {
//       play(ringtone);
//       stop(ringback);
//     } else if (phase === "calling") {
//       play(ringback);
//       stop(ringtone);
//     } else {
//       stop(ringtone);
//       stop(ringback);
//     }
//   }, [phase]);
// }

import { useEffect, useRef } from "react";
import type { CallPhase } from "@/context/CallContext";
import incomingRingtoneUrl from "@/assets/sounds/incoming-ringtone.mp3";
import outgoingRingbackUrl from "@/assets/sounds/outgoing-ringback.mp3";

/**
 * Plays the right looping sound for the current call phase:
 *  - "ringing"  (callee is being notified of an incoming call) -> ringtone
 *  - "calling"  (caller is waiting for the callee to pick up)  -> ringback
 *  - anything else                                             -> silence
 *
 * Mount this once, globally (alongside <GlobalCallOverlay />), and feed it
 * the live call phase. It owns its own <audio> elements so it keeps working
 * across re-renders/navigation without re-fetching the file each time.
 */
export function useCallSound(phase: CallPhase | undefined) {
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const ringbackRef = useRef<HTMLAudioElement | null>(null);

  // Create the <audio> elements once.
  useEffect(() => {
    const ringtone = new Audio(incomingRingtoneUrl);
    ringtone.loop = true;
    ringtone.preload = "auto";
    ringtoneRef.current = ringtone;

    const ringback = new Audio(outgoingRingbackUrl);
    ringback.loop = true;
    ringback.preload = "auto";
    ringbackRef.current = ringback;

    return () => {
      ringtone.pause();
      ringback.pause();
      ringtoneRef.current = null;
      ringbackRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ringtone = ringtoneRef.current;
    const ringback = ringbackRef.current;
    if (!ringtone || !ringback) return;

    const play = (el: HTMLAudioElement) => {
      el.currentTime = 0;
      // Autoplay can be blocked if there's been no user gesture yet; that's
      // fine for a ringtone/ringback (there's essentially always been prior
      // interaction with the app by the time a call is possible), but we
      // still swallow the rejection so it doesn't surface as an unhandled
      // promise rejection in the console.
      void el.play().catch(() => {});
    };
    const stop = (el: HTMLAudioElement) => {
      el.pause();
      el.currentTime = 0;
    };

    if (phase === "ringing") {
      play(ringtone);
      stop(ringback);
    } else if (phase === "calling") {
      play(ringback);
      stop(ringtone);
    } else {
      stop(ringtone);
      stop(ringback);
    }
  }, [phase]);
}

