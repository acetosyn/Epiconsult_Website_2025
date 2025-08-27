import json

# Define mapping of categories to departments & services
CATEGORY_MAPPING = {
    # Laboratory Department
    "HAEMATOLOGY GENERAL TESTS": ("Laboratory", "Laboratory"),
    "ENDOCRINOLOGY, THYROID FUNCTION TESTS": ("Laboratory", "Laboratory"),
    "DIABETES TESTS": ("Laboratory", "Laboratory"),
    "MICROBIOLOGY": ("Laboratory", "Laboratory"),
    "CYTOLOGY": ("Laboratory", "Laboratory"),
    "HIV TESTS": ("Laboratory", "Laboratory"),
    "SEROLOGY": ("Laboratory", "Laboratory"),
    "LIPIDS": ("Laboratory", "Laboratory"),

    # Hematology Department
    "BLOOD": ("Hematology", "Hematology"),
    "HAEMATOLOGY SPECIAL": ("Hematology", "Hematology"),

    # Cardiology / ECG & Echo
    "CARDIAC TESTS": ("Cardiology", "Cardiology"),
    "CARDIAC MARKERS": ("ECG & Echo", "ECG & Echo"),

    # Pulmonology Department
    "PULMONARY TESTS": ("Pulmonology", "Pulmonology"),
    "TB TESTS": ("Pulmonology", "Pulmonology"),

    # Gastroenterology
    "STOOL TESTS": ("Gastroenterology", "Gastroenterology"),
    "LIVER TESTS": ("Gastroenterology", "Gastroenterology"),

    # Obs & Gynecology
    "GYNE TESTS": ("Obs & Gynecology", "Obs & Gynecology"),
    "PAP SMEAR": ("Obs & Gynecology", "Obs & Gynecology"),
    "HPV": ("Obs & Gynecology", "Obs & Gynecology"),
}

# Full list of hospital services (departments)
DEPARTMENTS = [
    "Laboratory",
    "CT Scan / MRI",
    "Mammography",
    "ECG & Echo",
    "Ultrasound",
    "X-ray Imaging",
    "Hematology",
    "Gastroenterology",
    "Pulmonology",
    "Obs & Gynecology",
    "Cardiology",
    "General Outpatient"
]

def extract_and_group(input_file, output_file):
    with open(input_file, "r") as infile:
        data = json.load(infile)

    # Nested dict Department -> Service -> Category -> Tests
    structure = {dept: {"services": {}} for dept in DEPARTMENTS}

    for item in data:
        category = item.get("category") or "Uncategorized"
        test = item.get("test")

        if not test:
            continue

        # Find department & service mapping
        if category in CATEGORY_MAPPING:
            department, service = CATEGORY_MAPPING[category]
        else:
            # Default: put under Laboratory if unknown
            department, service = "Laboratory", "Laboratory"

        services = structure[department]["services"]
        if service not in services:
            services[service] = {}
        if category not in services[service]:
            services[service][category] = []
        services[service][category].append(test)

    # Sort categories and tests
    sorted_structure = {
        dept: {
            "services": {
                srv: {cat: sorted(tests) for cat, tests in sorted(cats.items())}
                for srv, cats in sorted(data["services"].items())
            }
        }
        for dept, data in sorted(structure.items())
    }

    with open(output_file, "w") as outfile:
        json.dump(sorted_structure, outfile, indent=4)

if __name__ == "__main__":
    extract_and_group("tests.json", "test_data.json")
