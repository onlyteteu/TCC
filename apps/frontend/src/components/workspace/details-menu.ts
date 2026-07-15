export function closeDetailsMenu(
  details: HTMLDetailsElement | null,
  { restoreFocus = false }: { restoreFocus?: boolean } = {}
) {
  if (!details) {
    return;
  }

  details.open = false;
  if (restoreFocus) {
    details.querySelector<HTMLElement>("summary")?.focus();
  }
}
