import os, glob

replacements = [
    # Main branding
    ("AgriSure Climate-Aware Credit Risk Assessment System", "AgriSure Climate-Aware Credit Risk Assessment System"),
    ("AgriSure Climate-Aware Credit Risk Assessment", "AgriSure Climate-Aware Credit Risk Assessment"),
    ("AgriSure Climate-Aware Credit Risk System", "AgriSure Climate-Aware Credit Risk System"),
    ("AgriSure Climate-Aware Agriculture Credit System", "AgriSure Climate-Aware Agriculture Credit System"),
    ("AgriSure Climate-Aware Agriculture Finance Network", "AgriSure Climate-Aware Agriculture Finance Network"),
    ("AgriSure Credit Risk System", "AgriSure Credit Risk System"),
    ("AgriSure Agriculture Finance", "AgriSure Agriculture Finance"),
    ("Official AgriSure KCC Application", "Official AgriSure KCC Application"),
    ("AgriSure Credit Officer Review Queue", "AgriSure Credit Officer Review Queue"),
    ("AgriSure Regional Office", "AgriSure Regional Office"),
    ("AgriSure Partner Branch", "AgriSure Partner Branch"),
    ("AgriSure PM Fasal Bima", "AgriSure PM Fasal Bima"),
    ("AgriSure Risk Mitigation Directives", "AgriSure Risk Mitigation Directives"),
    ("AgriSure CLIMATE CREDIT RISK REPORT", "AGRISURE CLIMATE CREDIT RISK REPORT"),
    ("AgriSure FIN-03", "AgriSure FIN-03"),
    ("AgriSure", "AgriSure"),
    ("agrisure", "agrisure"),
]

# Case-sensitive mapping replacements where AgriSure / agrisure appeared in code identifiers or storage keys
# Note: Keep storage key reading backwards compatible if needed
code_replacements = [
    ("AgriSure_AUTH_SESSION", "AGRISURE_AUTH_SESSION"),
    ("AgriSure_SECRET_KEY", "AGRISURE_SECRET_KEY"),
    ("agrisure_salt_2026", "agrisure_salt_2026"),
    ("AgriSure_OFFICER_INVITE", "AGRISURE_OFFICER_INVITE"),
]

files_to_update = [
    'index.html',
    'README.md',
    '.env.example',
    '.env'
] + glob.glob('js/*.js') + glob.glob('backend/*.py') + glob.glob('backend/analytics/*.py') + glob.glob('scratch/*.py')

updated_count = 0
for fpath in files_to_update:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    original = content
    # Perform AgriSure -> AgriSure replacements
    content = content.replace("AgriSure", "AgriSure")
    content = content.replace("agrisure", "agrisure")
    content = content.replace("AgriSure", "AgriSure")
    
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f"Updated: {fpath}")
        updated_count += 1

print(f"\nTotal files updated to AgriSure: {updated_count}")
