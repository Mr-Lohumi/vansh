import re

def fix_auth():
    with open('js/shared-auth.js', 'r', encoding='utf-8') as f:
        content = f.read()

    old_logic = """  // Return empty array for production (no demo data)
  return [];"""

    new_logic = """  // Fallback to initial seed data if local storage is empty
  if (typeof familyMembers !== 'undefined' && Array.isArray(familyMembers)) {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(familyMembers));
    return familyMembers;
  }
  return [];"""

    # Also update the parsed array length check to ensure empty arrays get seeded
    content = content.replace("if (Array.isArray(parsed)) {", "if (Array.isArray(parsed) && parsed.length > 0) {")
    content = content.replace(old_logic, new_logic)

    with open('js/shared-auth.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Fixed getActiveDatabase to seed mock data")

fix_auth()
