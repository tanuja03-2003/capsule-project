document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector("#eventGrid");
  const searchInput = document.querySelector("#searchInput");
  const category = document.querySelector("#categoryFilter");
  const city = document.querySelector("#cityFilter");
  const sort = document.querySelector("#sortFilter");
  const count = document.querySelector("#resultCount");

  let events = await getEvents();
  const params = new URLSearchParams(location.search);
  if (searchInput && params.get("search")) searchInput.value = params.get("search");

  function render() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const cat = category?.value || "";
    const selectedCity = city?.value || "";

    let filtered = events.filter(e =>
      (!q || `${e.title} ${e.category} ${e.venue} ${e.city}`.toLowerCase().includes(q)) &&
      (!cat || e.category === cat) &&
      (!selectedCity || e.city === selectedCity)
    );

    if (sort?.value === "priceLow") filtered.sort((a,b) => a.price-b.price);
    if (sort?.value === "priceHigh") filtered.sort((a,b) => b.price-a.price);
    if (sort?.value === "rating") filtered.sort((a,b) => b.rating-a.rating);

    count.textContent = `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`;
    grid.innerHTML = filtered.length
      ? filtered.map(eventCard).join("")
      : `<div class="empty" style="grid-column:1/-1">No events match your filters.</div>`;
  }

  [searchInput, category, city, sort].forEach(el => el?.addEventListener("input", render));
  render();
});
