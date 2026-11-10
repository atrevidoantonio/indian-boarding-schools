import json
from pathlib import Path

repository_root = Path(__file__).resolve().parent.parent
template_path = repository_root / "src" / "template.html"
application_path = repository_root / "src" / "app.js"
schools_path = repository_root / "data" / "schools.json"
post_deaths_path = repository_root / "data" / "post_deaths.json"
states_path = repository_root / "node_modules" / "us-atlas" / "states-10m.json"
reservations_path = repository_root / "data" / "reservations.topo.json"
output_path = repository_root / "index.html"

schools = json.loads(schools_path.read_text())
post_deaths = json.loads(post_deaths_path.read_text())

for school in schools:
    deaths = post_deaths.get(str(school["id"]))
    if deaths:
        school["d"] = deaths["post"]
        school["dg"] = deaths["govt"]


def embed(json_text):
    return json_text.replace("</", "<\\/")


page = template_path.read_text()
page = page.replace(
    "/*SCHOOLS*/", embed(json.dumps(schools, separators=(",", ":"), ensure_ascii=False))
)
page = page.replace("/*STATES*/", states_path.read_text())
page = page.replace("/*RES*/", embed(reservations_path.read_text()))
page = page.replace("/*APP*/", application_path.read_text())
output_path.write_text(page)
print(f"Wrote {output_path.name} ({len(page):,} bytes)")
