import { toast } from "sonner";

export async function shareInvitation() {
  const url = window.location.href.split("#")[0] ?? window.location.href;
  const data = { title: "শুভ বিবাহ — আমন্ত্রণ", text: "২৫ নভেম্বর ২০২৬ — আমাদের শুভ বিবাহে আপনাকে সাদর আমন্ত্রণ।", url };
  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("আমন্ত্রণের লিংক কপি হয়েছে");
  } catch (e) {
    if ((e as Error)?.name !== "AbortError") toast.error("শেয়ার করা যায়নি, আবার চেষ্টা করুন");
  }
}
