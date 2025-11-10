document.querySelectorAll('[data-include]').forEach(async (el) => {
  const url = el.getAttribute('data-include');
  const html = await fetch(url).then(r => r.text());
  el.outerHTML = html;
});