export function formatTimecode(seconds: number | null | undefined) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  if (hours > 0) {
    return [hours, minutes, remainingSeconds].map((item) => String(item).padStart(2, "0")).join(":");
  }

  return [minutes, remainingSeconds].map((item) => String(item).padStart(2, "0")).join(":");
}
