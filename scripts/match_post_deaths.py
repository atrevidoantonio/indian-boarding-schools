import csv
import difflib
import json
import re
import sys
from pathlib import Path

repository_root = Path(__file__).resolve().parent.parent
post_schools_path = repository_root / "data" / "raw" / "wapo_boarding_schools.csv"
schools_path = repository_root / "data" / "schools.json"
output_path = repository_root / "data" / "post_deaths.json"

state_names = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
}

manual_matches = {
    "St. Rose/St. Francis Xavier School": 171,
    "Lincoln Institution": 13,
    "Shawnee Methodist Mission and Indian Manual Labor School": 383,
    "Dwight Mission School": 540,
    "Lower Brule Industrial Boarding School": 18,
    "McCabe Boarding School": 37,
    "Colville Mission Boarding School": 518,
}

minimum_similarity = 0.9


def normalize_name(name):
    name = (name or "").lower().replace("st.", "saint").replace("’", "'")
    name = re.sub(r"\bst\b", "saint", name)
    if " - " in name:
        name = re.sub(r"\s*-\s*[a-z ,]+$", "", name)
    name = re.sub(r"\(.*?\)", "", name)
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", name).split())


def inventory_names(school):
    variant_names = [
        variant for variant in re.split(r";", school["v"] or "") if variant.strip()
    ]
    return [normalize_name(school["n"])] + [
        normalize_name(variant) for variant in variant_names
    ]


def name_similarity(post_school, inventory_school):
    post_name = normalize_name(post_school["School"])
    return max(
        difflib.SequenceMatcher(None, post_name, candidate).ratio()
        for candidate in inventory_names(inventory_school)
    )


with open(post_schools_path, encoding="utf-8-sig") as post_file:
    post_schools = list(csv.DictReader(post_file))
schools = json.loads(schools_path.read_text())

deaths_by_school = {}
unmatched_schools = []

for post_school in post_schools:
    post_deaths = int(post_school["deaths_documented_by_post"] or 0)
    interior_deaths = int(post_school["deaths_documented_by_govt"] or 0)
    state = state_names.get(post_school["State"].strip())

    same_state_schools = [school for school in schools if school["st"] == state]
    best_match = max(
        same_state_schools,
        key=lambda school: name_similarity(post_school, school),
        default=None,
    )
    best_similarity = name_similarity(post_school, best_match) if best_match else 0

    if best_similarity < minimum_similarity:
        national_match = max(
            schools, key=lambda school: name_similarity(post_school, school)
        )
        if name_similarity(post_school, national_match) >= 0.99:
            best_match = national_match
            best_similarity = 1

    if post_school["School"] in manual_matches:
        best_match = next(
            school
            for school in schools
            if school["id"] == manual_matches[post_school["School"]]
        )
        best_similarity = 1

    if best_match is None or best_similarity < minimum_similarity:
        unmatched_schools.append(
            (post_school["School"], post_school["State"], post_deaths)
        )
        continue

    record = deaths_by_school.setdefault(
        best_match["id"], {"post": 0, "govt": 0, "post_names": []}
    )
    record["post"] += post_deaths
    record["govt"] += interior_deaths
    record["post_names"].append(post_school["School"])

output_path.write_text(json.dumps(deaths_by_school, indent=1))

matched_deaths = sum(record["post"] for record in deaths_by_school.values())
print(
    f"{len(deaths_by_school)} schools matched, {matched_deaths} deaths on the map",
    file=sys.stderr,
)
for school_name, state, deaths in unmatched_schools:
    if deaths:
        print(f"unmatched: {school_name} ({state}), {deaths} deaths", file=sys.stderr)
