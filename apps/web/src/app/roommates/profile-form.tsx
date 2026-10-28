"use client";

import { useActionState } from "react";
import { saveRoommateProfile, type RoommateState } from "@/app/actions/roommate-actions";

const field = "mt-1 w-full rounded-field bg-paper px-3 py-2.5 text-sm text-ink hairline focus:outline-none focus:ring-2 focus:ring-kith-blue/40";
const label = "block text-xs font-medium text-ink/65";

export interface ProfileDefaults {
  budgetMinNaira?: number;
  budgetMaxNaira?: number;
  gender?: string | null;
  genderPreference?: string;
  sleepSchedule?: string;
  cleanliness?: number;
  smoker?: boolean;
  guests?: string;
  course?: string | null;
  bio?: string | null;
}

export function RoommateProfileForm({ defaults }: { defaults: ProfileDefaults }) {
  const [state, formAction, pending] = useActionState<RoommateState, FormData>(saveRoommateProfile, null);

  return (
    <form action={formAction} className="rounded-card bg-paper p-6 shadow-card hairline">
      <h2 className="text-lg">{defaults.budgetMaxNaira ? "Your roommate preferences" : "Set up roommate matching"}</h2>
      <p className="mt-1 text-sm text-ink/60">
        Only other verified students who are also looking can see this. No phone numbers, no chat.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="budgetMinNaira">Budget from (₦ / month)</label>
          <input id="budgetMinNaira" name="budgetMinNaira" type="number" min={20000} step={1000} defaultValue={defaults.budgetMinNaira ?? 60000} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="budgetMaxNaira">Budget up to (₦ / month)</label>
          <input id="budgetMaxNaira" name="budgetMaxNaira" type="number" min={20000} step={1000} defaultValue={defaults.budgetMaxNaira ?? 120000} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="genderPreference">Look for</label>
          <select id="genderPreference" name="genderPreference" defaultValue={defaults.genderPreference ?? "any"} className={field}>
            <option value="any">Anyone</option>
            <option value="female">Female roommate</option>
            <option value="male">Male roommate</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="gender">You are</label>
          <select id="gender" name="gender" defaultValue={defaults.gender ?? "prefer_not_to_say"} className={field}>
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="sleepSchedule">Sleep</label>
          <select id="sleepSchedule" name="sleepSchedule" defaultValue={defaults.sleepSchedule ?? "flexible"} className={field}>
            <option value="flexible">Flexible</option>
            <option value="early_bird">Early bird</option>
            <option value="night_owl">Night owl</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="cleanliness">Tidiness (1 relaxed – 5 particular)</label>
          <input id="cleanliness" name="cleanliness" type="range" min={1} max={5} defaultValue={defaults.cleanliness ?? 3} className="mt-3 w-full accent-kith-green" />
        </div>
        <div>
          <label className={label} htmlFor="guests">Guests</label>
          <select id="guests" name="guests" defaultValue={defaults.guests ?? "sometimes"} className={field}>
            <option value="never">Never</option>
            <option value="sometimes">Sometimes</option>
            <option value="often">Often</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="course">Course</label>
          <input id="course" name="course" defaultValue={defaults.course ?? ""} placeholder="Computer Science" className={field} />
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-xs font-medium text-ink/70">
        <input type="checkbox" name="smoker" value="true" defaultChecked={defaults.smoker} className="accent-kith-green" />
        I smoke
      </label>

      <label className={`${label} mt-4`} htmlFor="bio">A line about you (optional)</label>
      <textarea id="bio" name="bio" rows={2} defaultValue={defaults.bio ?? ""} maxLength={600}
        placeholder="Third-year law student, quiet, cooks on weekends." className={field} />

      {state?.error && <p role="alert" className="mt-3 text-sm font-medium text-danger">{state.error}</p>}
      {state?.ok && <p className="mt-3 text-sm font-medium text-kith-green-deep">Saved — matches below are up to date.</p>}

      <button type="submit" disabled={pending}
        className="mt-5 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-paper hover:bg-navy-soft disabled:opacity-60">
        {pending ? "Saving…" : defaults.budgetMaxNaira ? "Update preferences" : "Start matching"}
      </button>
    </form>
  );
}
