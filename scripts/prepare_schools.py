import json
import re
import sys
from pathlib import Path

repository_root = Path(__file__).resolve().parent.parent
inventory_path = repository_root / "data" / "raw" / "nabs_schools.geojson"
output_path = repository_root / "data" / "schools.json"

catholic_pattern = re.compile(
    r"catholic|jesuit|benedictine|ursuline|franciscan|capuchin"
)
protestant_pattern = re.compile(
    r"presbyter|episcopal|methodist|congregational|american board of commissioners|quaker|"
    r"society of friends|baptist|lutheran|mennonite|moravian|reformed church|adventist"
)
year_pattern = re.compile(r"1[6-9][0-9]{2}|20[0-2][0-9]")

date_corrections = {
    342: {"e": 1933},
    507: {"s": 1884},
}

inventory = json.loads(inventory_path.read_text())
schools = []

for feature in inventory["features"]:
    properties = feature["properties"]
    if properties.get("Unique_Total_BSI__internal_") != "Yes" or not feature.get(
        "geometry"
    ):
        continue

    school_text = " ".join(
        str(properties.get(field) or "")
        for field in [
            "Operator",
            "General_Notes",
            "Boarding_School_Name",
            "Variant_Names",
        ]
    ).lower()
    is_catholic = bool(catholic_pattern.search(school_text))
    is_protestant = bool(protestant_pattern.search(school_text))
    operator = properties.get("Operator") or ""
    school_type = properties.get("Type") or ""

    if is_catholic and is_protestant:
        operator_category = "M"
    elif is_catholic:
        operator_category = "C"
    elif is_protestant:
        operator_category = "P"
    elif "federal" in operator.lower() or "government" in school_type.lower():
        operator_category = "F"
    else:
        operator_category = "U"

    opening_match = year_pattern.search(str(properties.get("Date_Desc__Start_") or ""))
    closing_text = str(properties.get("Date_Desc__End_") or "")
    still_open = bool(re.search(r"(?i)open", closing_text))
    closing_match = year_pattern.search(closing_text)
    object_id = properties["ObjectId"]

    school = {
        "id": object_id,
        "n": properties.get("Boarding_School_Name")
        or properties.get("Display_Name__Digital_Map___Int"),
        "v": properties.get("Variant_Names") or "",
        "l": properties.get("Location") or "",
        "st": properties.get("State") or "",
        "x": round(feature["geometry"]["coordinates"][0], 4),
        "y": round(feature["geometry"]["coordinates"][1], 4),
        "s": int(opening_match.group()) if opening_match else None,
        "e": (
            None
            if still_open
            else (int(closing_match.group()) if closing_match else None)
        ),
        "o": 1 if still_open else 0,
        "sd": properties.get("Date_Desc__Start_") or "",
        "ed": closing_text,
        "c": operator_category,
        "op": operator,
        "t": school_type.replace("|", " · "),
        "u": properties.get("objectURL") or "",
    }

    if object_id in date_corrections:
        school.update(date_corrections[object_id])
        if "e" in date_corrections[object_id]:
            school["o"] = 0
        school["fix"] = 1

    if properties.get("Notes_Author") == "United States Department of the Interior":
        school["g"] = properties.get("General_Notes") or ""

    schools.append(school)

output_path.write_text(json.dumps(schools, separators=(",", ":"), ensure_ascii=False))
print(
    f"{len(schools)} schools written to {output_path.relative_to(repository_root)}",
    file=sys.stderr,
)
